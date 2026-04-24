import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';
import { Offer, OfferDocument, OfferStatus } from './schemas/offer.schema';
import { Technician, TechnicianDocument, TechnicianAvailability } from '../technicians/schemas/technician.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Commission, CommissionDocument } from '../commission/schemas/commission.schema';
import {
  CreateBookingDto, SetPriceDto, ConfirmCompletionDto,
  SubmitOfferDto, SelectOfferDto,
} from './dto/booking.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)    private bookingModel: Model<BookingDocument>,
    @InjectModel(Offer.name)      private offerModel: Model<OfferDocument>,
    @InjectModel(Technician.name) private techModel: Model<TechnicianDocument>,
    @InjectModel(User.name)       private userModel: Model<UserDocument>,
    @InjectModel(Commission.name) private commissionModel: Model<CommissionDocument>,
    private config: ConfigService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  private async findTechByUserId(userId: string): Promise<TechnicianDocument> {
    let tech = await this.techModel.findOne({ user: userId });
    if (!tech) {
      try { tech = await this.techModel.findOne({ user: new Types.ObjectId(userId) }); } catch {}
    }
    if (!tech) throw new NotFoundException('Technician profile not found');
    return tech;
  }

  private getUserId(req: any): string {
    return req?.userId || req?.sub || req?._id || req?.id || String(req);
  }

  // ─── 1. Create booking (Customer) ────────────────────────────────────────
  async createBooking(customerId: string, dto: CreateBookingDto) {
    const active = await this.bookingModel.findOne({
      customer: customerId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.EN_ROUTE, BookingStatus.IN_PROGRESS] },
    });
    if (active) throw new BadRequestException('You already have an active booking. Please complete or cancel it first.');

    const booking = await this.bookingModel.create({
      customer:           customerId,
      serviceType:        dto.serviceType,
      problemDescription: dto.problemDescription,
      customerNote:       dto.customerNote,
      scheduledFor:       dto.scheduledFor,
      customerLocation: {
        type:        'Point',
        coordinates: [dto.customerLocation.longitude, dto.customerLocation.latitude],
        address:     dto.customerLocation.address,
        city:        dto.customerLocation.city,
      },
    });

    // Broadcast to all online technicians via Socket.IO
    this.notificationsGateway.notifyNearbyTechnicians(dto.serviceType, booking);
    return booking;
  }

  // ─── 2. Submit offer (Technician — inDrive model) ────────────────────────
  async submitOffer(techUserId: string, bookingId: string, dto: SubmitOfferDto) {
    const tech = await this.findTechByUserId(techUserId);

    if (tech.isCommissionLocked) {
      throw new ForbiddenException('Your account is locked due to unpaid commission. Please pay to continue receiving jobs.');
    }
    if (tech.activeBooking) {
      throw new ForbiddenException('You must complete your current job before applying for a new one.');
    }

    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('This booking is no longer accepting offers');
    }

    const alreadyOffered = await this.offerModel.findOne({ booking: bookingId, technician: tech._id });
    if (alreadyOffered) throw new BadRequestException('You have already submitted an offer for this booking');

    const offer = await this.offerModel.create({
      booking:          new Types.ObjectId(bookingId),
      technician:       tech._id,
      technicianUserId: tech.user,
      price:            dto.price,
      note:             dto.note,
    });

    await this.bookingModel.findByIdAndUpdate(bookingId, { $inc: { totalOffers: 1 } });

    // Notify customer of new offer
    const populated = await offer.populate({
      path: 'technician',
      populate: { path: 'user', select: 'fullName phone profilePicture' },
    });
    this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:new_offer', {
      bookingId: bookingId,
      offer:     populated,
    });

    return offer;
  }

  // ─── 3. Get offers for a booking (Customer sees all bids) ────────────────
  async getOffers(bookingId: string, userId: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer.toString() !== userId) {
      throw new ForbiddenException('Only the booking owner can view offers');
    }

    return this.offerModel
      .find({ booking: bookingId, status: OfferStatus.PENDING })
      .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone profilePicture' } })
      .sort({ price: 1 })
      .lean();
  }

  // ─── 4. Select offer — customer chooses a technician (inDrive accept) ────
  async selectOffer(customerId: string, bookingId: string, dto: SelectOfferDto) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer.toString() !== customerId) throw new ForbiddenException('Access denied');
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('This booking is no longer accepting selections');
    }

    const selectedOffer = await this.offerModel.findById(dto.offerId).populate('technician');
    if (!selectedOffer || selectedOffer.booking.toString() !== bookingId) {
      throw new NotFoundException('Offer not found');
    }

    const tech = selectedOffer.technician as any;

    // Accept selected offer
    await this.offerModel.findByIdAndUpdate(dto.offerId, { status: OfferStatus.ACCEPTED });

    // Reject all other pending offers for this booking
    await this.offerModel.updateMany(
      { booking: bookingId, _id: { $ne: dto.offerId }, status: OfferStatus.PENDING },
      { status: OfferStatus.EXPIRED },
    );

    // Update booking
    await this.bookingModel.findByIdAndUpdate(bookingId, {
      technician:  tech._id,
      status:      BookingStatus.ACCEPTED,
      quotedPrice: selectedOffer.price,
      acceptedAt:  new Date(),
    });

    // Lock technician to this job
    await this.techModel.findByIdAndUpdate(tech._id, {
      activeBooking: new Types.ObjectId(bookingId),
      availability:  TechnicianAvailability.BUSY,
    });

    // Notify winning technician
    this.notificationsGateway.notifyUser(tech.user.toString(), 'booking:offer_selected', {
      bookingId,
      message: 'Your offer was accepted! Please proceed to the customer location.',
      quotedPrice: selectedOffer.price,
    });

    return { message: 'Technician selected successfully', bookingId };
  }

  // ─── 5. Technician direct accept (legacy flow) ───────────────────────────
  async acceptBooking(techUserId: string, bookingId: string) {
    const tech = await this.findTechByUserId(techUserId);
    if (tech.isCommissionLocked) throw new ForbiddenException('Pay outstanding commission first');
    if (tech.activeBooking)      throw new ForbiddenException('Complete your current job first');

    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is no longer available');
    }

    await this.bookingModel.findByIdAndUpdate(bookingId, {
      technician: tech._id, status: BookingStatus.ACCEPTED, acceptedAt: new Date(),
    });
    await this.techModel.findByIdAndUpdate(tech._id, {
      activeBooking: new Types.ObjectId(bookingId), availability: TechnicianAvailability.BUSY,
    });

    this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:accepted', {
      bookingId, message: 'A technician has accepted your request!',
    });
    return { message: 'Booking accepted' };
  }

  // ─── 6. Reject / skip booking ────────────────────────────────────────────
  async rejectBooking(techUserId: string, bookingId: string) {
    const tech = await this.findTechByUserId(techUserId);
    await this.bookingModel.findByIdAndUpdate(bookingId, {
      $addToSet: { rejectedByTechnicians: tech._id },
    });
    await this.offerModel.findOneAndUpdate(
      { booking: bookingId, technician: tech._id },
      { status: OfferStatus.EXPIRED },
    );
    return { message: 'Booking rejected' };
  }

  // ─── 7. Set / update quoted price ────────────────────────────────────────
  async setPrice(techUserId: string, bookingId: string, dto: SetPriceDto) {
    const tech    = await this.findTechByUserId(techUserId);
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.technician?.toString() !== tech._id.toString()) {
      throw new ForbiddenException('You are not assigned to this booking');
    }

    await this.bookingModel.findByIdAndUpdate(bookingId, {
      quotedPrice:    dto.quotedPrice,
      technicianNote: dto.technicianNote,
    });

    this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:price_updated', {
      bookingId, quotedPrice: dto.quotedPrice, note: dto.technicianNote,
    });
    return { message: 'Price set successfully' };
  }

  // ─── 8. Start job (en route → in progress) ───────────────────────────────
  async startJob(techUserId: string, bookingId: string) {
    const tech    = await this.findTechByUserId(techUserId);
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.technician?.toString() !== tech._id.toString()) {
      throw new ForbiddenException('Not your booking');
    }
    if (![BookingStatus.ACCEPTED, BookingStatus.EN_ROUTE].includes(booking.status)) {
      throw new BadRequestException('Cannot start job from current status');
    }

    const updated = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status: BookingStatus.IN_PROGRESS, startedAt: new Date() },
      { new: true },
    );

    this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:started', {
      bookingId, message: 'Your technician has started the job!',
    });
    return updated;
  }

  // ─── 9. Complete job (Technician marks done) ─────────────────────────────
  async completeJob(techUserId: string, bookingId: string) {
    const tech    = await this.findTechByUserId(techUserId);
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.technician?.toString() !== tech._id.toString()) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Job must be in progress to mark complete');
    }

    const rate = this.config.get<number>('PLATFORM_COMMISSION_RATE', 10);
    const commissionAmount = (booking.quotedPrice || 0) * rate / 100;

    const updated = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      {
        status:           BookingStatus.COMPLETED,
        completedAt:      new Date(),
        commissionAmount: commissionAmount,
      },
      { new: true },
    );

    this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:completed', {
      bookingId,
      message: 'Job completed! Please confirm and rate the service.',
    });
    return updated;
  }

  // ─── 10. Confirm + rate (Customer) ───────────────────────────────────────
  async confirmCompletion(customerId: string, bookingId: string, dto: ConfirmCompletionDto) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer.toString() !== customerId) throw new ForbiddenException('Not your booking');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking must be completed before confirmation');
    }

    const rate             = this.config.get<number>('PLATFORM_COMMISSION_RATE', 10);
    const commissionAmount = dto.finalPrice * rate / 100;

    const updated = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      {
        status:           BookingStatus.CONFIRMED,
        finalPrice:       dto.finalPrice,
        commissionAmount: commissionAmount,
        confirmedAt:      new Date(),
        customerRating:   dto.rating,
        customerReview:   dto.review,
      },
      { new: true },
    );

    const tech = await this.techModel.findById(booking.technician);
    if (tech) {
      // Commission record
      await this.commissionModel.create({
        technician:       tech._id,
        booking:          booking._id,
        jobPrice:         dto.finalPrice,
        commissionRate:   rate,
        commissionAmount: commissionAmount,
      });

      // Update technician stats
      const newTotal  = tech.totalRatings + 1;
      const newAvg    = ((tech.averageRating * tech.totalRatings) + dto.rating) / newTotal;
      await this.techModel.findByIdAndUpdate(tech._id, {
        activeBooking:      null,
        availability:       TechnicianAvailability.OFFLINE,
        isCommissionLocked: true,
        pendingCommission:  (tech.pendingCommission || 0) + commissionAmount,
        totalJobs:          (tech.totalJobs || 0) + 1,
        totalEarnings:      (tech.totalEarnings || 0) + (dto.finalPrice - commissionAmount),
        averageRating:      newAvg,
        totalRatings:       newTotal,
      });

      // Update customer booking count
      await this.userModel.findByIdAndUpdate(customerId, { $inc: { totalBookings: 1 } });

      // Notify technician
      this.notificationsGateway.notifyUser(tech.user.toString(), 'booking:confirmed', {
        bookingId,
        finalPrice:       dto.finalPrice,
        commissionAmount: commissionAmount,
        rating:           dto.rating,
        message:          `Job confirmed! Commission of ₨${commissionAmount.toLocaleString()} is due.`,
      });
    }

    return updated;
  }

  // ─── 11. Cancel booking ───────────────────────────────────────────────────
  async cancelBooking(userId: string, bookingId: string, reason?: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    const isCustomer = booking.customer.toString() === userId;
    const tech       = booking.technician ? await this.techModel.findById(booking.technician) : null;
    const isTech     = tech?.user?.toString() === userId;

    if (!isCustomer && !isTech) throw new ForbiddenException('Access denied');

    if ([BookingStatus.COMPLETED, BookingStatus.CONFIRMED, BookingStatus.CANCELLED].includes(booking.status)) {
      throw new BadRequestException('Booking cannot be cancelled at this stage');
    }

    await this.bookingModel.findByIdAndUpdate(bookingId, {
      status:              BookingStatus.CANCELLED,
      cancellationReason:  reason || 'Cancelled by user',
      cancelledBy:         isCustomer ? 'customer' : 'technician',
    });

    // Release technician lock
    if (tech) {
      await this.techModel.findByIdAndUpdate(tech._id, {
        activeBooking: null,
        availability:  TechnicianAvailability.OFFLINE,
      });
    }

    // Expire all pending offers
    await this.offerModel.updateMany({ booking: bookingId, status: OfferStatus.PENDING }, { status: OfferStatus.EXPIRED });

    // Cross-notify
    if (isCustomer && tech) {
      this.notificationsGateway.notifyUser(tech.user.toString(), 'booking:cancelled', {
        bookingId, message: `Booking cancelled by customer. Reason: ${reason || 'No reason given'}`,
      });
    } else if (isTech) {
      this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:cancelled', {
        bookingId, message: `Booking cancelled by technician. Reason: ${reason || 'No reason given'}`,
      });
    }

    return { message: 'Booking cancelled successfully' };
  }

  // ─── 12. Get my bookings (Customer) ──────────────────────────────────────
  async getMyBookings(customerId: string, status?: string) {
    const filter: any = { customer: customerId };
    if (status) filter.status = status;
    return this.bookingModel
      .find(filter)
      .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone profilePicture' } })
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── 13. Get my jobs (Technician) ────────────────────────────────────────
  async getMyJobs(techUserId: string, status?: string) {
    const tech   = await this.findTechByUserId(techUserId);
    const filter: any = { technician: tech._id };
    if (status) filter.status = status;
    return this.bookingModel
      .find(filter)
      .populate('customer', 'fullName phone profilePicture')
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── 14. Get nearby pending bookings (Technician) ────────────────────────
  async getNearbyPending(techUserId: string, radius: number = 50) {
    return this.bookingModel
      .find({ status: BookingStatus.PENDING })
      .populate('customer', 'fullName phone profilePicture')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  }

  // ─── 15. Get booking by ID ────────────────────────────────────────────────
  async getBookingById(bookingId: string, userId: string) {
    const booking = await this.bookingModel
      .findById(bookingId)
      .populate('customer', 'fullName phone profilePicture averageRating')
      .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone profilePicture' } })
      .lean();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }
}

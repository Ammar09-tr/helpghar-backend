"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const booking_schema_1 = require("./schemas/booking.schema");
const offer_schema_1 = require("./schemas/offer.schema");
const technician_schema_1 = require("../technicians/schemas/technician.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const commission_schema_1 = require("../commission/schemas/commission.schema");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let BookingsService = class BookingsService {
    constructor(bookingModel, offerModel, techModel, userModel, commissionModel, config, notificationsGateway) {
        this.bookingModel = bookingModel;
        this.offerModel = offerModel;
        this.techModel = techModel;
        this.userModel = userModel;
        this.commissionModel = commissionModel;
        this.config = config;
        this.notificationsGateway = notificationsGateway;
    }
    async findTechByUserId(userId) {
        let tech = await this.techModel.findOne({ user: userId });
        if (!tech) {
            try {
                tech = await this.techModel.findOne({ user: new mongoose_2.Types.ObjectId(userId) });
            }
            catch { }
        }
        if (!tech)
            throw new common_1.NotFoundException('Technician profile not found');
        return tech;
    }
    getUserId(req) {
        return req?.userId || req?.sub || req?._id || req?.id || String(req);
    }
    async createBooking(customerId, dto) {
        const active = await this.bookingModel.findOne({
            customer: customerId,
            status: { $in: [booking_schema_1.BookingStatus.PENDING, booking_schema_1.BookingStatus.ACCEPTED, booking_schema_1.BookingStatus.EN_ROUTE, booking_schema_1.BookingStatus.IN_PROGRESS] },
        });
        if (active)
            throw new common_1.BadRequestException('You already have an active booking. Please complete or cancel it first.');
        const booking = await this.bookingModel.create({
            customer: customerId,
            serviceType: dto.serviceType,
            problemDescription: dto.problemDescription,
            customerNote: dto.customerNote,
            scheduledFor: dto.scheduledFor,
            customerLocation: {
                type: 'Point',
                coordinates: [dto.customerLocation.longitude, dto.customerLocation.latitude],
                address: dto.customerLocation.address,
                city: dto.customerLocation.city,
            },
        });
        this.notificationsGateway.notifyNearbyTechnicians(dto.serviceType, booking);
        return booking;
    }
    async submitOffer(techUserId, bookingId, dto) {
        const tech = await this.findTechByUserId(techUserId);
        if (tech.isCommissionLocked) {
            throw new common_1.ForbiddenException('Your account is locked due to unpaid commission. Please pay to continue receiving jobs.');
        }
        if (tech.activeBooking) {
            throw new common_1.ForbiddenException('You must complete your current job before applying for a new one.');
        }
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.status !== booking_schema_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('This booking is no longer accepting offers');
        }
        const alreadyOffered = await this.offerModel.findOne({ booking: bookingId, technician: tech._id });
        if (alreadyOffered)
            throw new common_1.BadRequestException('You have already submitted an offer for this booking');
        const offer = await this.offerModel.create({
            booking: new mongoose_2.Types.ObjectId(bookingId),
            technician: tech._id,
            technicianUserId: tech.user,
            price: dto.price,
            note: dto.note,
        });
        await this.bookingModel.findByIdAndUpdate(bookingId, { $inc: { totalOffers: 1 } });
        const populated = await offer.populate({
            path: 'technician',
            populate: { path: 'user', select: 'fullName phone profilePicture' },
        });
        this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:new_offer', {
            bookingId: bookingId,
            offer: populated,
        });
        return offer;
    }
    async getOffers(bookingId, userId) {
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.customer.toString() !== userId) {
            throw new common_1.ForbiddenException('Only the booking owner can view offers');
        }
        return this.offerModel
            .find({ booking: bookingId, status: offer_schema_1.OfferStatus.PENDING })
            .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone profilePicture' } })
            .sort({ price: 1 })
            .lean();
    }
    async selectOffer(customerId, bookingId, dto) {
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.customer.toString() !== customerId)
            throw new common_1.ForbiddenException('Access denied');
        if (booking.status !== booking_schema_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('This booking is no longer accepting selections');
        }
        const selectedOffer = await this.offerModel.findById(dto.offerId).populate('technician');
        if (!selectedOffer || selectedOffer.booking.toString() !== bookingId) {
            throw new common_1.NotFoundException('Offer not found');
        }
        const tech = selectedOffer.technician;
        await this.offerModel.findByIdAndUpdate(dto.offerId, { status: offer_schema_1.OfferStatus.ACCEPTED });
        await this.offerModel.updateMany({ booking: bookingId, _id: { $ne: dto.offerId }, status: offer_schema_1.OfferStatus.PENDING }, { status: offer_schema_1.OfferStatus.EXPIRED });
        await this.bookingModel.findByIdAndUpdate(bookingId, {
            technician: tech._id,
            status: booking_schema_1.BookingStatus.ACCEPTED,
            quotedPrice: selectedOffer.price,
            acceptedAt: new Date(),
        });
        await this.techModel.findByIdAndUpdate(tech._id, {
            activeBooking: new mongoose_2.Types.ObjectId(bookingId),
            availability: technician_schema_1.TechnicianAvailability.BUSY,
        });
        this.notificationsGateway.notifyUser(tech.user.toString(), 'booking:offer_selected', {
            bookingId,
            message: 'Your offer was accepted! Please proceed to the customer location.',
            quotedPrice: selectedOffer.price,
        });
        return { message: 'Technician selected successfully', bookingId };
    }
    async acceptBooking(techUserId, bookingId) {
        const tech = await this.findTechByUserId(techUserId);
        if (tech.isCommissionLocked)
            throw new common_1.ForbiddenException('Pay outstanding commission first');
        if (tech.activeBooking)
            throw new common_1.ForbiddenException('Complete your current job first');
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.status !== booking_schema_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Booking is no longer available');
        }
        await this.bookingModel.findByIdAndUpdate(bookingId, {
            technician: tech._id, status: booking_schema_1.BookingStatus.ACCEPTED, acceptedAt: new Date(),
        });
        await this.techModel.findByIdAndUpdate(tech._id, {
            activeBooking: new mongoose_2.Types.ObjectId(bookingId), availability: technician_schema_1.TechnicianAvailability.BUSY,
        });
        this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:accepted', {
            bookingId, message: 'A technician has accepted your request!',
        });
        return { message: 'Booking accepted' };
    }
    async rejectBooking(techUserId, bookingId) {
        const tech = await this.findTechByUserId(techUserId);
        await this.bookingModel.findByIdAndUpdate(bookingId, {
            $addToSet: { rejectedByTechnicians: tech._id },
        });
        await this.offerModel.findOneAndUpdate({ booking: bookingId, technician: tech._id }, { status: offer_schema_1.OfferStatus.EXPIRED });
        return { message: 'Booking rejected' };
    }
    async setPrice(techUserId, bookingId, dto) {
        const tech = await this.findTechByUserId(techUserId);
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.technician?.toString() !== tech._id.toString()) {
            throw new common_1.ForbiddenException('You are not assigned to this booking');
        }
        await this.bookingModel.findByIdAndUpdate(bookingId, {
            quotedPrice: dto.quotedPrice,
            technicianNote: dto.technicianNote,
        });
        this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:price_updated', {
            bookingId, quotedPrice: dto.quotedPrice, note: dto.technicianNote,
        });
        return { message: 'Price set successfully' };
    }
    async startJob(techUserId, bookingId) {
        const tech = await this.findTechByUserId(techUserId);
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.technician?.toString() !== tech._id.toString()) {
            throw new common_1.ForbiddenException('Not your booking');
        }
        if (![booking_schema_1.BookingStatus.ACCEPTED, booking_schema_1.BookingStatus.EN_ROUTE].includes(booking.status)) {
            throw new common_1.BadRequestException('Cannot start job from current status');
        }
        const updated = await this.bookingModel.findByIdAndUpdate(bookingId, { status: booking_schema_1.BookingStatus.IN_PROGRESS, startedAt: new Date() }, { new: true });
        this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:started', {
            bookingId, message: 'Your technician has started the job!',
        });
        return updated;
    }
    async completeJob(techUserId, bookingId) {
        const tech = await this.findTechByUserId(techUserId);
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.technician?.toString() !== tech._id.toString()) {
            throw new common_1.ForbiddenException('Not your booking');
        }
        if (booking.status !== booking_schema_1.BookingStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Job must be in progress to mark complete');
        }
        const rate = this.config.get('PLATFORM_COMMISSION_RATE', 10);
        const commissionAmount = (booking.quotedPrice || 0) * rate / 100;
        const updated = await this.bookingModel.findByIdAndUpdate(bookingId, {
            status: booking_schema_1.BookingStatus.COMPLETED,
            completedAt: new Date(),
            commissionAmount: commissionAmount,
        }, { new: true });
        this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:completed', {
            bookingId,
            message: 'Job completed! Please confirm and rate the service.',
        });
        return updated;
    }
    async confirmCompletion(customerId, bookingId, dto) {
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.customer.toString() !== customerId)
            throw new common_1.ForbiddenException('Not your booking');
        if (booking.status !== booking_schema_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Booking must be completed before confirmation');
        }
        const rate = this.config.get('PLATFORM_COMMISSION_RATE', 10);
        const commissionAmount = dto.finalPrice * rate / 100;
        const updated = await this.bookingModel.findByIdAndUpdate(bookingId, {
            status: booking_schema_1.BookingStatus.CONFIRMED,
            finalPrice: dto.finalPrice,
            commissionAmount: commissionAmount,
            confirmedAt: new Date(),
            customerRating: dto.rating,
            customerReview: dto.review,
        }, { new: true });
        const tech = await this.techModel.findById(booking.technician);
        if (tech) {
            await this.commissionModel.create({
                technician: tech._id,
                booking: booking._id,
                jobPrice: dto.finalPrice,
                commissionRate: rate,
                commissionAmount: commissionAmount,
            });
            const newTotal = tech.totalRatings + 1;
            const newAvg = ((tech.averageRating * tech.totalRatings) + dto.rating) / newTotal;
            await this.techModel.findByIdAndUpdate(tech._id, {
                activeBooking: null,
                availability: technician_schema_1.TechnicianAvailability.OFFLINE,
                isCommissionLocked: true,
                pendingCommission: (tech.pendingCommission || 0) + commissionAmount,
                totalJobs: (tech.totalJobs || 0) + 1,
                totalEarnings: (tech.totalEarnings || 0) + (dto.finalPrice - commissionAmount),
                averageRating: newAvg,
                totalRatings: newTotal,
            });
            await this.userModel.findByIdAndUpdate(customerId, { $inc: { totalBookings: 1 } });
            this.notificationsGateway.notifyUser(tech.user.toString(), 'booking:confirmed', {
                bookingId,
                finalPrice: dto.finalPrice,
                commissionAmount: commissionAmount,
                rating: dto.rating,
                message: `Job confirmed! Commission of ₨${commissionAmount.toLocaleString()} is due.`,
            });
        }
        return updated;
    }
    async cancelBooking(userId, bookingId, reason) {
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const isCustomer = booking.customer.toString() === userId;
        const tech = booking.technician ? await this.techModel.findById(booking.technician) : null;
        const isTech = tech?.user?.toString() === userId;
        if (!isCustomer && !isTech)
            throw new common_1.ForbiddenException('Access denied');
        if ([booking_schema_1.BookingStatus.COMPLETED, booking_schema_1.BookingStatus.CONFIRMED, booking_schema_1.BookingStatus.CANCELLED].includes(booking.status)) {
            throw new common_1.BadRequestException('Booking cannot be cancelled at this stage');
        }
        await this.bookingModel.findByIdAndUpdate(bookingId, {
            status: booking_schema_1.BookingStatus.CANCELLED,
            cancellationReason: reason || 'Cancelled by user',
            cancelledBy: isCustomer ? 'customer' : 'technician',
        });
        if (tech) {
            await this.techModel.findByIdAndUpdate(tech._id, {
                activeBooking: null,
                availability: technician_schema_1.TechnicianAvailability.OFFLINE,
            });
        }
        await this.offerModel.updateMany({ booking: bookingId, status: offer_schema_1.OfferStatus.PENDING }, { status: offer_schema_1.OfferStatus.EXPIRED });
        if (isCustomer && tech) {
            this.notificationsGateway.notifyUser(tech.user.toString(), 'booking:cancelled', {
                bookingId, message: `Booking cancelled by customer. Reason: ${reason || 'No reason given'}`,
            });
        }
        else if (isTech) {
            this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:cancelled', {
                bookingId, message: `Booking cancelled by technician. Reason: ${reason || 'No reason given'}`,
            });
        }
        return { message: 'Booking cancelled successfully' };
    }
    async getMyBookings(customerId, status) {
        const filter = { customer: customerId };
        if (status)
            filter.status = status;
        return this.bookingModel
            .find(filter)
            .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone profilePicture' } })
            .sort({ createdAt: -1 })
            .lean();
    }
    async getMyJobs(techUserId, status) {
        const tech = await this.findTechByUserId(techUserId);
        const filter = { technician: tech._id };
        if (status)
            filter.status = status;
        return this.bookingModel
            .find(filter)
            .populate('customer', 'fullName phone profilePicture')
            .sort({ createdAt: -1 })
            .lean();
    }
    async getNearbyPending(techUserId, radius = 50) {
        return this.bookingModel
            .find({ status: booking_schema_1.BookingStatus.PENDING })
            .populate('customer', 'fullName phone profilePicture')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
    }
    async getBookingById(bookingId, userId) {
        const booking = await this.bookingModel
            .findById(bookingId)
            .populate('customer', 'fullName phone profilePicture averageRating')
            .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone profilePicture' } })
            .lean();
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(1, (0, mongoose_1.InjectModel)(offer_schema_1.Offer.name)),
    __param(2, (0, mongoose_1.InjectModel)(technician_schema_1.Technician.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(commission_schema_1.Commission.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService,
        notifications_gateway_1.NotificationsGateway])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map
// ─── chat.service.ts ─────────────────────────────────────────────────────────
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Technician, TechnicianDocument } from '../technicians/schemas/technician.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';

export class SendMessageDto {
  content: string;
  imageUrl?: string;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)    private msgModel: Model<MessageDocument>,
    @InjectModel(Booking.name)    private bookingModel: Model<BookingDocument>,
    @InjectModel(Technician.name) private techModel: Model<TechnicianDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async sendMessage(userId: string, role: string, bookingId: string, dto: SendMessageDto) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    // Verify sender is part of this booking
    const isCustomer = booking.customer.toString() === userId;
    let isTech = false;
    if (!isCustomer && booking.technician) {
      const tech = await this.techModel.findById(booking.technician);
      isTech = tech?.user?.toString() === userId;
    }
    if (!isCustomer && !isTech) throw new ForbiddenException('You are not part of this booking');

    const message = await this.msgModel.create({
      booking:    bookingId,
      sender:     userId,
      senderRole: role,
      content:    dto.content.trim(),
      imageUrl:   dto.imageUrl,
    });

    const populated = await message.populate('sender', 'fullName profilePicture role');

    // Broadcast via Socket.IO so both parties see it instantly
    this.notificationsGateway.broadcastChatMessage(bookingId, populated);

    return populated;
  }

  async getMessages(userId: string, bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    const messages = await this.msgModel
      .find({ booking: bookingId })
      .populate('sender', 'fullName profilePicture role')
      .sort({ createdAt: 1 })
      .lean();

    // Mark unread messages as read
    await this.msgModel.updateMany(
      { booking: bookingId, sender: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return messages;
  }

  async getUnreadCount(userId: string) {
    const userBookings = await this.bookingModel.find({
      $or: [{ customer: userId }],
    }).select('_id');

    const ids = userBookings.map(b => b._id);
    const count = await this.msgModel.countDocuments({
      booking:  { $in: ids },
      sender:   { $ne: userId },
      isRead:   false,
    });
    return { unreadCount: count };
  }
}

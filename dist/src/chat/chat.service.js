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
exports.ChatService = exports.SendMessageDto = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const booking_schema_1 = require("../bookings/schemas/booking.schema");
const technician_schema_1 = require("../technicians/schemas/technician.schema");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
let ChatService = class ChatService {
    constructor(msgModel, bookingModel, techModel, notificationsGateway) {
        this.msgModel = msgModel;
        this.bookingModel = bookingModel;
        this.techModel = techModel;
        this.notificationsGateway = notificationsGateway;
    }
    async sendMessage(userId, role, bookingId, dto) {
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const isCustomer = booking.customer.toString() === userId;
        let isTech = false;
        if (!isCustomer && booking.technician) {
            const tech = await this.techModel.findById(booking.technician);
            isTech = tech?.user?.toString() === userId;
        }
        if (!isCustomer && !isTech)
            throw new common_1.ForbiddenException('You are not part of this booking');
        const message = await this.msgModel.create({
            booking: bookingId,
            sender: userId,
            senderRole: role,
            content: dto.content.trim(),
            imageUrl: dto.imageUrl,
        });
        const populated = await message.populate('sender', 'fullName profilePicture role');
        this.notificationsGateway.broadcastChatMessage(bookingId, populated);
        return populated;
    }
    async getMessages(userId, bookingId) {
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const messages = await this.msgModel
            .find({ booking: bookingId })
            .populate('sender', 'fullName profilePicture role')
            .sort({ createdAt: 1 })
            .lean();
        await this.msgModel.updateMany({ booking: bookingId, sender: { $ne: userId }, isRead: false }, { isRead: true, readAt: new Date() });
        return messages;
    }
    async getUnreadCount(userId) {
        const userBookings = await this.bookingModel.find({
            $or: [{ customer: userId }],
        }).select('_id');
        const ids = userBookings.map(b => b._id);
        const count = await this.msgModel.countDocuments({
            booking: { $in: ids },
            sender: { $ne: userId },
            isRead: false,
        });
        return { unreadCount: count };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(2, (0, mongoose_1.InjectModel)(technician_schema_1.Technician.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], ChatService);
//# sourceMappingURL=chat.service.js.map
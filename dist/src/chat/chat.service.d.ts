import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { BookingDocument } from '../bookings/schemas/booking.schema';
import { TechnicianDocument } from '../technicians/schemas/technician.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class SendMessageDto {
    content: string;
    imageUrl?: string;
}
export declare class ChatService {
    private msgModel;
    private bookingModel;
    private techModel;
    private notificationsGateway;
    constructor(msgModel: Model<MessageDocument>, bookingModel: Model<BookingDocument>, techModel: Model<TechnicianDocument>, notificationsGateway: NotificationsGateway);
    sendMessage(userId: string, role: string, bookingId: string, dto: SendMessageDto): Promise<Omit<import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getMessages(userId: string, bookingId: string): Promise<(import("mongoose").FlattenMaps<MessageDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
}

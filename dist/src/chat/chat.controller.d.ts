import { ChatService } from './chat.service';
declare class SendMessageDto {
    content: string;
    imageUrl?: string;
}
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    sendMessage(req: any, bookingId: string, dto: SendMessageDto): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/message.schema").MessageDocument, {}, {}> & import("./schemas/message.schema").Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getMessages(req: any, bookingId: string): Promise<(import("mongoose").FlattenMaps<import("./schemas/message.schema").MessageDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
}
export {};

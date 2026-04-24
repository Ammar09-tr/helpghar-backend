import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
export declare class UploadController {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    uploadProfilePicture(req: any, file: Express.Multer.File): Promise<{
        url: string;
        message: string;
    }>;
    uploadBookingImages(files: Express.Multer.File[]): {
        urls: string[];
        message: string;
    };
    uploadCnicImages(files: Express.Multer.File[]): {
        urls: string[];
        message: string;
    };
    uploadChatImage(file: Express.Multer.File): {
        url: string;
        message: string;
    };
}
export declare class UploadModule {
}

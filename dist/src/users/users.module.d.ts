import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
declare class UpdateProfileDto {
    fullName?: string;
    phone?: string;
    email?: string;
}
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    getProfile(userId: string): Promise<import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
export declare class UsersModule {
}
export {};

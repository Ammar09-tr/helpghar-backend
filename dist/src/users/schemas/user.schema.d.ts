import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    CUSTOMER = "customer",
    TECHNICIAN = "technician",
    ADMIN = "admin"
}
export declare class User {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    profilePicture?: string;
    fcmToken?: string;
    totalBookings: number;
    averageRating: number;
    totalRatings: number;
    location?: {
        type: string;
        coordinates: [number, number];
        address: string;
        city: string;
    };
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;

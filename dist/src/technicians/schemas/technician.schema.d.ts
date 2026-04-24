import { Document, Types } from 'mongoose';
export type TechnicianDocument = Technician & Document;
export declare enum ServiceType {
    ELECTRICIAN = "electrician",
    PLUMBER = "plumber",
    AC_TECHNICIAN = "ac_technician",
    PAINTER = "painter",
    CARPENTER = "carpenter",
    CLEANER = "cleaner",
    WELDER = "welder",
    OTHER = "other"
}
export declare enum TechnicianStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUSPENDED = "suspended"
}
export declare enum TechnicianAvailability {
    ONLINE = "online",
    OFFLINE = "offline",
    BUSY = "busy"
}
export declare class Technician {
    user: Types.ObjectId;
    skill: ServiceType;
    cnic: string;
    cnicFrontImage?: string;
    cnicBackImage?: string;
    status: TechnicianStatus;
    rejectionReason?: string;
    availability: TechnicianAvailability;
    isCommissionLocked: boolean;
    pendingCommission: number;
    totalEarnings: number;
    totalJobs: number;
    averageRating: number;
    totalRatings: number;
    currentLocation?: {
        type: string;
        coordinates: [number, number];
        updatedAt: Date;
    };
    activeBooking: Types.ObjectId | null;
    bio?: string;
    yearsOfExperience: number;
    certificationImages?: string[];
}
export declare const TechnicianSchema: import("mongoose").Schema<Technician, import("mongoose").Model<Technician, any, any, any, Document<unknown, any, Technician, any, {}> & Technician & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Technician, Document<unknown, {}, import("mongoose").FlatRecord<Technician>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Technician> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;

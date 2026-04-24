import { Document, Types } from 'mongoose';
import { ServiceType } from '../../technicians/schemas/technician.schema';
export type BookingDocument = Booking & Document;
export declare enum BookingStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    EN_ROUTE = "en_route",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    REJECTED = "rejected"
}
export declare class Booking {
    customer: Types.ObjectId;
    technician?: Types.ObjectId;
    serviceType: ServiceType;
    problemDescription: string;
    problemImages?: string[];
    customerLocation: {
        type: string;
        coordinates: [number, number];
        address: string;
        city: string;
    };
    status: BookingStatus;
    rejectedByTechnicians: Types.ObjectId[];
    totalOffers: number;
    quotedPrice?: number;
    finalPrice?: number;
    commissionAmount?: number;
    commissionPaid: boolean;
    customerNote?: string;
    technicianNote?: string;
    scheduledFor?: Date;
    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    confirmedAt?: Date;
    customerRating?: number;
    customerReview?: string;
    cancellationReason?: string;
    cancelledBy?: string;
}
export declare const BookingSchema: import("mongoose").Schema<Booking, import("mongoose").Model<Booking, any, any, any, Document<unknown, any, Booking, any, {}> & Booking & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Booking, Document<unknown, {}, import("mongoose").FlatRecord<Booking>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Booking> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;

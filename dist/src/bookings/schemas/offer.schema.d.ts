import { Document, Types } from 'mongoose';
export type OfferDocument = Offer & Document;
export declare enum OfferStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare class Offer {
    booking: Types.ObjectId;
    technician: Types.ObjectId;
    technicianUserId?: Types.ObjectId;
    price: number;
    note?: string;
    status: OfferStatus;
}
export declare const OfferSchema: import("mongoose").Schema<Offer, import("mongoose").Model<Offer, any, any, any, Document<unknown, any, Offer, any, {}> & Offer & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Offer, Document<unknown, {}, import("mongoose").FlatRecord<Offer>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Offer> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;

import { Document, Types } from 'mongoose';
export type CommissionDocument = Commission & Document;
export declare enum CommissionStatus {
    PENDING = "pending",
    PAID = "paid"
}
export declare class Commission {
    technician: Types.ObjectId;
    booking: Types.ObjectId;
    jobPrice: number;
    commissionRate: number;
    commissionAmount: number;
    status: CommissionStatus;
    paidAt?: Date;
    paymentMethod?: string;
    transactionId?: string;
}
export declare const CommissionSchema: import("mongoose").Schema<Commission, import("mongoose").Model<Commission, any, any, any, Document<unknown, any, Commission, any, {}> & Commission & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Commission, Document<unknown, {}, import("mongoose").FlatRecord<Commission>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Commission> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;

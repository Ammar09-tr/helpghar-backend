import { Model } from 'mongoose';
import { CommissionDocument } from './schemas/commission.schema';
import { TechnicianDocument } from '../technicians/schemas/technician.schema';
declare class PayCommissionDto {
    paymentMethod: string;
    transactionId?: string;
}
export declare class CommissionService {
    private commModel;
    private techModel;
    constructor(commModel: Model<CommissionDocument>, techModel: Model<TechnicianDocument>);
    getMyPending(techUserId: string): Promise<(import("mongoose").FlattenMaps<CommissionDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getMyHistory(techUserId: string): Promise<(import("mongoose").FlattenMaps<CommissionDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    pay(techUserId: string, dto: PayCommissionDto): Promise<{
        message: string;
    }>;
    getAdminStats(): Promise<{
        pending: {
            total: any;
            count: any;
        };
        paid: {
            total: any;
            count: any;
        };
    }>;
}
export declare class CommissionController {
    private svc;
    constructor(svc: CommissionService);
    getMyPending(req: any): Promise<(import("mongoose").FlattenMaps<CommissionDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getMyHistory(req: any): Promise<(import("mongoose").FlattenMaps<CommissionDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    pay(req: any, dto: PayCommissionDto): Promise<{
        message: string;
    }>;
    adminStats(): Promise<{
        pending: {
            total: any;
            count: any;
        };
        paid: {
            total: any;
            count: any;
        };
    }>;
}
export declare class CommissionModule {
}
export {};

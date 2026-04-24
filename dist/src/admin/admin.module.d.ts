import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { TechnicianDocument } from '../technicians/schemas/technician.schema';
import { BookingDocument } from '../bookings/schemas/booking.schema';
import { CommissionDocument } from '../commission/schemas/commission.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
declare class RejectTechDto {
    reason?: string;
}
declare class CancelBookingDto {
    reason: string;
}
declare class ToggleUserDto {
    action: 'activate' | 'deactivate' | 'block';
}
export declare class AdminService {
    private userModel;
    private techModel;
    private bookingModel;
    private commModel;
    private notificationsGateway;
    constructor(userModel: Model<UserDocument>, techModel: Model<TechnicianDocument>, bookingModel: Model<BookingDocument>, commModel: Model<CommissionDocument>, notificationsGateway: NotificationsGateway);
    getDashboardStats(): Promise<{
        users: {
            total: number;
            customers: number;
        };
        technicians: {
            total: number;
            pending: number;
            approved: number;
        };
        bookings: {
            total: number;
            active: number;
            completed: number;
        };
        commission: {
            pending: {
                total: any;
                count: any;
            };
            paid: {
                total: any;
                count: any;
            };
        };
    }>;
    getAllTechnicians(status?: string): Promise<(import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getTechnicianDetail(techId: string): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    approveTechnician(techId: string): Promise<{
        message: string;
    }>;
    rejectTechnician(techId: string, reason?: string): Promise<{
        message: string;
    }>;
    suspendTechnician(techId: string): Promise<{
        message: string;
    }>;
    getAllUsers(role?: string): Promise<(import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getUserDetail(userId: string): Promise<any>;
    toggleUserStatus(userId: string, action: string): Promise<{
        message: string;
    }>;
    getAllBookings(status?: string): Promise<(import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    cancelBookingAdmin(bookingId: string, reason: string): Promise<{
        message: string;
    }>;
    getAllCommissions(status?: string): Promise<(import("mongoose").FlattenMaps<CommissionDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    markCommissionPaid(commId: string): Promise<{
        message: string;
    }>;
}
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getDashboard(): Promise<{
        users: {
            total: number;
            customers: number;
        };
        technicians: {
            total: number;
            pending: number;
            approved: number;
        };
        bookings: {
            total: number;
            active: number;
            completed: number;
        };
        commission: {
            pending: {
                total: any;
                count: any;
            };
            paid: {
                total: any;
                count: any;
            };
        };
    }>;
    getTechnicians(status?: string): Promise<(import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getTechnicianDetail(id: string): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    approveTechnician(id: string): Promise<{
        message: string;
    }>;
    rejectTechnician(id: string, dto: RejectTechDto): Promise<{
        message: string;
    }>;
    suspendTechnician(id: string): Promise<{
        message: string;
    }>;
    getUsers(role?: string): Promise<(import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getUserDetail(id: string): Promise<any>;
    toggleUser(id: string, dto: ToggleUserDto): Promise<{
        message: string;
    }>;
    getAllBookings(status?: string): Promise<(import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    cancelBooking(id: string, dto: CancelBookingDto): Promise<{
        message: string;
    }>;
    getCommissions(status?: string): Promise<(import("mongoose").FlattenMaps<CommissionDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    markPaid(id: string): Promise<{
        message: string;
    }>;
}
export declare class AdminModule {
}
export {};

import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { Offer, OfferDocument } from './schemas/offer.schema';
import { TechnicianDocument } from '../technicians/schemas/technician.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { CommissionDocument } from '../commission/schemas/commission.schema';
import { CreateBookingDto, SetPriceDto, ConfirmCompletionDto, SubmitOfferDto, SelectOfferDto } from './dto/booking.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class BookingsService {
    private bookingModel;
    private offerModel;
    private techModel;
    private userModel;
    private commissionModel;
    private config;
    private notificationsGateway;
    constructor(bookingModel: Model<BookingDocument>, offerModel: Model<OfferDocument>, techModel: Model<TechnicianDocument>, userModel: Model<UserDocument>, commissionModel: Model<CommissionDocument>, config: ConfigService, notificationsGateway: NotificationsGateway);
    private findTechByUserId;
    private getUserId;
    createBooking(customerId: string, dto: CreateBookingDto): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    submitOffer(techUserId: string, bookingId: string, dto: SubmitOfferDto): Promise<import("mongoose").Document<unknown, {}, OfferDocument, {}, {}> & Offer & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getOffers(bookingId: string, userId: string): Promise<(import("mongoose").FlattenMaps<OfferDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    selectOffer(customerId: string, bookingId: string, dto: SelectOfferDto): Promise<{
        message: string;
        bookingId: string;
    }>;
    acceptBooking(techUserId: string, bookingId: string): Promise<{
        message: string;
    }>;
    rejectBooking(techUserId: string, bookingId: string): Promise<{
        message: string;
    }>;
    setPrice(techUserId: string, bookingId: string, dto: SetPriceDto): Promise<{
        message: string;
    }>;
    startJob(techUserId: string, bookingId: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    completeJob(techUserId: string, bookingId: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    confirmCompletion(customerId: string, bookingId: string, dto: ConfirmCompletionDto): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cancelBooking(userId: string, bookingId: string, reason?: string): Promise<{
        message: string;
    }>;
    getMyBookings(customerId: string, status?: string): Promise<(import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getMyJobs(techUserId: string, status?: string): Promise<(import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getNearbyPending(techUserId: string, radius?: number): Promise<(import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getBookingById(bookingId: string, userId: string): Promise<import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}

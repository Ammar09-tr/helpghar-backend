import { BookingsService } from './bookings.service';
import { CreateBookingDto, SetPriceDto, ConfirmCompletionDto, SubmitOfferDto, SelectOfferDto, CancelBookingDto } from './dto/booking.dto';
export declare class BookingsController {
    private svc;
    constructor(svc: BookingsService);
    create(req: any, dto: CreateBookingDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getMyBookings(req: any, status?: string): Promise<(import("mongoose").FlattenMaps<import("./schemas/booking.schema").BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getNearby(req: any, radius?: number): Promise<(import("mongoose").FlattenMaps<import("./schemas/booking.schema").BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getMyJobs(req: any, status?: string): Promise<(import("mongoose").FlattenMaps<import("./schemas/booking.schema").BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById(id: string, req: any): Promise<import("mongoose").FlattenMaps<import("./schemas/booking.schema").BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    submitOffer(req: any, id: string, dto: SubmitOfferDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/offer.schema").OfferDocument, {}, {}> & import("./schemas/offer.schema").Offer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getOffers(id: string, req: any): Promise<(import("mongoose").FlattenMaps<import("./schemas/offer.schema").OfferDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    selectOffer(req: any, id: string, dto: SelectOfferDto): Promise<{
        message: string;
        bookingId: string;
    }>;
    accept(req: any, id: string): Promise<{
        message: string;
    }>;
    reject(req: any, id: string): Promise<{
        message: string;
    }>;
    setPrice(req: any, id: string, dto: SetPriceDto): Promise<{
        message: string;
    }>;
    startJob(req: any, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    completeJob(req: any, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    confirm(req: any, id: string, dto: ConfirmCompletionDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cancel(req: any, id: string, dto: CancelBookingDto): Promise<{
        message: string;
    }>;
}

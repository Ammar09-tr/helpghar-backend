import { ServiceType } from '../../technicians/schemas/technician.schema';
export declare class LocationDto {
    longitude: number;
    latitude: number;
    address: string;
    city: string;
}
export declare class CreateBookingDto {
    serviceType: ServiceType;
    problemDescription: string;
    customerNote?: string;
    scheduledFor?: Date;
    customerLocation: LocationDto;
}
export declare class SubmitOfferDto {
    price: number;
    note?: string;
}
export declare class SelectOfferDto {
    offerId: string;
}
export declare class SetPriceDto {
    quotedPrice: number;
    technicianNote?: string;
}
export declare class ConfirmCompletionDto {
    finalPrice: number;
    rating: number;
    review?: string;
}
export declare class CancelBookingDto {
    reason?: string;
}

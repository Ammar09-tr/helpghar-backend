import { Model } from 'mongoose';
import { TechnicianDocument, TechnicianAvailability } from './schemas/technician.schema';
declare class UpdateAvailabilityDto {
    availability: TechnicianAvailability;
}
declare class UpdateLocationDto {
    longitude: number;
    latitude: number;
}
declare class UpdateProfileDto {
    bio?: string;
    yearsOfExperience?: number;
}
export declare class TechniciansService {
    private techModel;
    constructor(techModel: Model<TechnicianDocument>);
    getMyProfile(userId: string): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateAvailability(userId: string, dto: UpdateAvailabilityDto): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateLocation(userId: string, dto: UpdateLocationDto): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getNearby(serviceType: string, longitude: number, latitude: number, radius?: number): Promise<(import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
export declare class TechniciansController {
    private svc;
    constructor(svc: TechniciansService);
    getMyProfile(req: any): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateAvailability(req: any, dto: UpdateAvailabilityDto): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateLocation(req: any, dto: UpdateLocationDto): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getNearby(serviceType: string, longitude: number, latitude: number, radius?: number): Promise<(import("mongoose").FlattenMaps<TechnicianDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
export declare class TechniciansModule {
}
export {};

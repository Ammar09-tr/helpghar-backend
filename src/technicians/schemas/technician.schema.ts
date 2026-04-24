import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TechnicianDocument = Technician & Document;

export enum ServiceType {
  ELECTRICIAN   = 'electrician',
  PLUMBER       = 'plumber',
  AC_TECHNICIAN = 'ac_technician',
  PAINTER       = 'painter',
  CARPENTER     = 'carpenter',
  CLEANER       = 'cleaner',
  WELDER        = 'welder',
  OTHER         = 'other',
}

export enum TechnicianStatus {
  PENDING   = 'pending',
  APPROVED  = 'approved',
  REJECTED  = 'rejected',
  SUSPENDED = 'suspended',
}

export enum TechnicianAvailability {
  ONLINE  = 'online',
  OFFLINE = 'offline',
  BUSY    = 'busy',
}

@Schema({ timestamps: true })
export class Technician {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ enum: ServiceType, required: true })
  skill: ServiceType;

  /** CNIC is mandatory for all technician registrations */
  @Prop({ required: true, trim: true })
  cnic: string;

  @Prop()
  cnicFrontImage?: string;

  @Prop()
  cnicBackImage?: string;

  @Prop({ enum: TechnicianStatus, default: TechnicianStatus.PENDING })
  status: TechnicianStatus;

  @Prop()
  rejectionReason?: string;

  @Prop({ enum: TechnicianAvailability, default: TechnicianAvailability.OFFLINE })
  availability: TechnicianAvailability;

  @Prop({ default: false })
  isCommissionLocked: boolean;

  @Prop({ default: 0 })
  pendingCommission: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop({ default: 0 })
  totalJobs: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  totalRatings: number;

  @Prop({ type: Object })
  currentLocation?: {
    type: string;
    coordinates: [number, number];
    updatedAt: Date;
  };

  @Prop({ type: Types.ObjectId, ref: 'Booking', default: null })
  activeBooking: Types.ObjectId | null;

  @Prop()
  bio?: string;

  @Prop({ default: 0 })
  yearsOfExperience: number;

  @Prop([String])
  certificationImages?: string[];
}

export const TechnicianSchema = SchemaFactory.createForClass(Technician);
TechnicianSchema.index({ currentLocation: '2dsphere' });
TechnicianSchema.index({ skill: 1, availability: 1, status: 1 });

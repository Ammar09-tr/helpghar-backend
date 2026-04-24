import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ServiceType } from '../../technicians/schemas/technician.schema';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING     = 'pending',
  ACCEPTED    = 'accepted',
  EN_ROUTE    = 'en_route',
  IN_PROGRESS = 'in_progress',
  COMPLETED   = 'completed',
  CONFIRMED   = 'confirmed',
  CANCELLED   = 'cancelled',
  REJECTED    = 'rejected',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Technician' })
  technician?: Types.ObjectId;

  @Prop({ enum: ServiceType, required: true })
  serviceType: ServiceType;

  @Prop({ required: true, minlength: 10 })
  problemDescription: string;

  @Prop([String])
  problemImages?: string[];

  @Prop({ type: Object, required: true })
  customerLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
    city: string;
  };

  @Prop({ enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Technician' }], default: [] })
  rejectedByTechnicians: Types.ObjectId[];

  @Prop({ default: 0 })
  totalOffers: number;

  @Prop()
  quotedPrice?: number;

  @Prop()
  finalPrice?: number;

  @Prop()
  commissionAmount?: number;

  @Prop({ default: false })
  commissionPaid: boolean;

  @Prop()
  customerNote?: string;

  @Prop()
  technicianNote?: string;

  @Prop()
  scheduledFor?: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  confirmedAt?: Date;

  @Prop({ min: 1, max: 5 })
  customerRating?: number;

  @Prop()
  customerReview?: string;

  @Prop()
  cancellationReason?: string;

  @Prop()
  cancelledBy?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ customer: 1, status: 1 });
BookingSchema.index({ technician: 1, status: 1 });
BookingSchema.index({ serviceType: 1, status: 1 });
BookingSchema.index({ 'customerLocation': '2dsphere' });

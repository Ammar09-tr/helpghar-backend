import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

export enum OfferStatus {
  PENDING  = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED  = 'expired',
}

@Schema({ timestamps: true })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  booking: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Technician', required: true })
  technician: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  technicianUserId?: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  price: number;

  @Prop()
  note?: string;

  @Prop({ enum: OfferStatus, default: OfferStatus.PENDING })
  status: OfferStatus;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
OfferSchema.index({ booking: 1, technician: 1 }, { unique: true });
OfferSchema.index({ booking: 1, status: 1 });

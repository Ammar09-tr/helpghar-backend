import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommissionDocument = Commission & Document;

export enum CommissionStatus {
  PENDING = 'pending',
  PAID    = 'paid',
}

@Schema({ timestamps: true })
export class Commission {
  @Prop({ type: Types.ObjectId, ref: 'Technician', required: true })
  technician: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  booking: Types.ObjectId;

  @Prop({ required: true })
  jobPrice: number;

  @Prop({ required: true })
  commissionRate: number;

  @Prop({ required: true })
  commissionAmount: number;

  @Prop({ enum: CommissionStatus, default: CommissionStatus.PENDING })
  status: CommissionStatus;

  @Prop()
  paidAt?: Date;

  @Prop()
  paymentMethod?: string;

  @Prop()
  transactionId?: string;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);
CommissionSchema.index({ technician: 1, status: 1 });
CommissionSchema.index({ booking: 1 });

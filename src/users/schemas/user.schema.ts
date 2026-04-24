import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CUSTOMER  = 'customer',
  TECHNICIAN = 'technician',
  ADMIN     = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  profilePicture?: string;

  @Prop()
  fcmToken?: string;

  @Prop({ default: 0 })
  totalBookings: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  totalRatings: number;

  @Prop({ type: Object })
  location?: {
    type: string;
    coordinates: [number, number];
    address: string;
    city: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ 'location': '2dsphere' });

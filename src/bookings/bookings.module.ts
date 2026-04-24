import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { Technician, TechnicianSchema } from '../technicians/schemas/technician.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Commission, CommissionSchema } from '../commission/schemas/commission.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name,    schema: BookingSchema    },
      { name: Offer.name,      schema: OfferSchema      },
      { name: Technician.name, schema: TechnicianSchema },
      { name: User.name,       schema: UserSchema       },
      { name: Commission.name, schema: CommissionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

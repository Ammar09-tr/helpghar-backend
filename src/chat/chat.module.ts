import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { Technician, TechnicianSchema } from '../technicians/schemas/technician.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name,    schema: MessageSchema    },
      { name: Booking.name,    schema: BookingSchema    },
      { name: Technician.name, schema: TechnicianSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}

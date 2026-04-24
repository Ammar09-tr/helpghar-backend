import {
  Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto, SetPriceDto, ConfirmCompletionDto,
  SubmitOfferDto, SelectOfferDto, CancelBookingDto,
} from './dto/booking.dto';

const uid = (req: any) => req.user?.userId || req.user?.sub || req.user?._id;

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('bookings')
export class BookingsController {
  constructor(private svc: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service booking request (Customer)' })
  create(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.svc.createBooking(uid(req), dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my bookings (Customer)' })
  getMyBookings(@Request() req: any, @Query('status') status?: string) {
    return this.svc.getMyBookings(uid(req), status);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby pending bookings (Technician)' })
  getNearby(@Request() req: any, @Query('radius') radius?: number) {
    return this.svc.getNearbyPending(uid(req), radius ? Number(radius) : 50);
  }

  @Get('tech/my-jobs')
  @ApiOperation({ summary: 'Get my assigned jobs (Technician)' })
  getMyJobs(@Request() req: any, @Query('status') status?: string) {
    return this.svc.getMyJobs(uid(req), status);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Request() req: any) {
    return this.svc.getBookingById(id, uid(req));
  }

  @Post(':id/offer')
  @ApiOperation({ summary: 'Technician submits a price offer (inDrive model)' })
  submitOffer(@Request() req: any, @Param('id') id: string, @Body() dto: SubmitOfferDto) {
    return this.svc.submitOffer(uid(req), id, dto);
  }

  @Get(':id/offers')
  @ApiOperation({ summary: 'Get all offers for a booking (Customer)' })
  getOffers(@Param('id') id: string, @Request() req: any) {
    return this.svc.getOffers(id, uid(req));
  }

  @Patch(':id/select-offer')
  @ApiOperation({ summary: 'Customer selects a technician offer' })
  selectOffer(@Request() req: any, @Param('id') id: string, @Body() dto: SelectOfferDto) {
    return this.svc.selectOffer(uid(req), id, dto);
  }

  @Patch(':id/accept')
  accept(@Request() req: any, @Param('id') id: string) {
    return this.svc.acceptBooking(uid(req), id);
  }

  @Patch(':id/reject')
  reject(@Request() req: any, @Param('id') id: string) {
    return this.svc.rejectBooking(uid(req), id);
  }

  @Patch(':id/set-price')
  setPrice(@Request() req: any, @Param('id') id: string, @Body() dto: SetPriceDto) {
    return this.svc.setPrice(uid(req), id, dto);
  }

  @Patch(':id/start')
  startJob(@Request() req: any, @Param('id') id: string) {
    return this.svc.startJob(uid(req), id);
  }

  @Patch(':id/complete')
  completeJob(@Request() req: any, @Param('id') id: string) {
    return this.svc.completeJob(uid(req), id);
  }

  @Patch(':id/confirm')
  confirm(@Request() req: any, @Param('id') id: string, @Body() dto: ConfirmCompletionDto) {
    return this.svc.confirmCompletion(uid(req), id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Request() req: any, @Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.svc.cancelBooking(uid(req), id, dto.reason);
  }
}

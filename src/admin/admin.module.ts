import {
  Injectable, NotFoundException, BadRequestException,
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, Module,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { User, UserDocument, UserRole, UserSchema } from '../users/schemas/user.schema';
import { Technician, TechnicianDocument, TechnicianStatus, TechnicianSchema } from '../technicians/schemas/technician.schema';
import { Booking, BookingDocument, BookingStatus, BookingSchema } from '../bookings/schemas/booking.schema';
import { Commission, CommissionDocument, CommissionStatus, CommissionSchema } from '../commission/schemas/commission.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { RolesGuard, Roles } from '../common/guards/roles.guard';

class RejectTechDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
class CancelBookingDto {
  @ApiProperty() @IsString() @IsNotEmpty() reason: string;
}
class ToggleUserDto {
  @ApiProperty() @IsString() @IsNotEmpty() action: 'activate' | 'deactivate' | 'block';
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)       private userModel: Model<UserDocument>,
    @InjectModel(Technician.name) private techModel: Model<TechnicianDocument>,
    @InjectModel(Booking.name)    private bookingModel: Model<BookingDocument>,
    @InjectModel(Commission.name) private commModel: Model<CommissionDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async getDashboardStats() {
    const [
      totalCustomers, totalTechs, pendingTechs, approvedTechs,
      totalBookings, activeBookings, completedBookings,
      totalUsers, commStats,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: UserRole.CUSTOMER }),
      this.techModel.countDocuments(),
      this.techModel.countDocuments({ status: TechnicianStatus.PENDING }),
      this.techModel.countDocuments({ status: TechnicianStatus.APPROVED }),
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: { $in: [BookingStatus.ACCEPTED, BookingStatus.EN_ROUTE, BookingStatus.IN_PROGRESS] } }),
      this.bookingModel.countDocuments({ status: BookingStatus.CONFIRMED }),
      this.userModel.countDocuments(),
      this.commModel.aggregate([{ $group: { _id: '$status', total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } }]),
    ]);
    const cm: any = {};
    commStats.forEach((s: any) => { cm[s._id] = s; });
    return {
      users:      { total: totalUsers, customers: totalCustomers },
      technicians:{ total: totalTechs, pending: pendingTechs, approved: approvedTechs },
      bookings:   { total: totalBookings, active: activeBookings, completed: completedBookings },
      commission: {
        pending: { total: cm.pending?.total || 0, count: cm.pending?.count || 0 },
        paid:    { total: cm.paid?.total    || 0, count: cm.paid?.count    || 0 },
      },
    };
  }

  async getAllTechnicians(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.techModel
      .find(filter)
      .populate('user', 'fullName email phone createdAt isActive profilePicture')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getTechnicianDetail(techId: string) {
    const tech = await this.techModel
      .findById(techId)
      .populate('user', 'fullName email phone createdAt isActive profilePicture')
      .lean();
    if (!tech) throw new NotFoundException('Technician not found');
    return tech;
  }

  async approveTechnician(techId: string) {
    const tech = await this.techModel.findById(techId);
    if (!tech) throw new NotFoundException('Technician not found');
    if (tech.status !== TechnicianStatus.PENDING)
      throw new BadRequestException('Technician is not in pending state');
    tech.status = TechnicianStatus.APPROVED;
    await tech.save();
    this.notificationsGateway.notifyUser(tech.user.toString(), 'account:approved', {
      message: 'Your technician account has been approved! You can now go online and accept jobs.',
    });
    return { message: 'Technician approved successfully' };
  }

  async rejectTechnician(techId: string, reason?: string) {
    const tech = await this.techModel.findById(techId);
    if (!tech) throw new NotFoundException('Technician not found');
    tech.status = TechnicianStatus.REJECTED;
    tech.rejectionReason = reason;
    await tech.save();
    this.notificationsGateway.notifyUser(tech.user.toString(), 'account:rejected', {
      message: `Your technician application was rejected. ${reason || ''}`.trim(),
    });
    return { message: 'Technician rejected' };
  }

  async suspendTechnician(techId: string) {
    const tech = await this.techModel.findByIdAndUpdate(
      techId, { status: TechnicianStatus.SUSPENDED }, { new: true },
    );
    if (!tech) throw new NotFoundException('Technician not found');
    await this.userModel.findByIdAndUpdate(tech.user, { isActive: false });
    this.notificationsGateway.notifyUser(tech.user.toString(), 'account:suspended', {
      message: 'Your account has been suspended. Please contact admin support.',
    });
    return { message: 'Technician suspended' };
  }

  async getAllUsers(role?: string) {
    const filter: any = { role: { $ne: UserRole.ADMIN } };
    if (role) filter.role = role;
    return this.userModel.find(filter).sort({ createdAt: -1 }).lean();
  }

async getUserDetail(userId: string): Promise<any>  {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    const tech = user.role === UserRole.TECHNICIAN
      ? await this.techModel.findOne({ user: userId }).lean()
      : null;
    const bookings = await this.bookingModel.find({ customer: userId }).countDocuments();
    return { ...user, technicianProfile: tech, totalBookings: bookings };
  }

  async toggleUserStatus(userId: string, action: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN) throw new BadRequestException('Cannot modify admin account');

    const isActive = action === 'activate';
    await this.userModel.findByIdAndUpdate(userId, { isActive });

    this.notificationsGateway.notifyUser(userId, isActive ? 'account:activated' : 'account:deactivated', {
      message: isActive
        ? 'Your account has been reactivated. Welcome back!'
        : 'Your account has been deactivated. Contact support for assistance.',
    });

    return { message: `User ${isActive ? 'activated' : 'deactivated'} successfully` };
  }

  async getAllBookings(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.bookingModel
      .find(filter)
      .populate('customer', 'fullName phone')
      .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone' } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async cancelBookingAdmin(bookingId: string, reason: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if ([BookingStatus.CONFIRMED, BookingStatus.CANCELLED].includes(booking.status))
      throw new BadRequestException('Cannot cancel a completed or already cancelled booking');

    booking.status             = BookingStatus.CANCELLED;
    booking.cancellationReason = reason;
    booking.cancelledBy        = 'admin';
    await booking.save();

    this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:cancelled_admin', {
      message: `Your booking was cancelled by admin. Reason: ${reason}`,
    });
    if (booking.technician) {
      this.notificationsGateway.notifyUser(booking.technician.toString(), 'booking:cancelled_admin', {
        message: `Booking cancelled by admin. Reason: ${reason}`,
      });
    }
    return { message: 'Booking cancelled by admin' };
  }

  async getAllCommissions(status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.commModel
      .find(filter)
      .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone' } })
      .populate('booking', 'serviceType finalPrice createdAt')
      .sort({ createdAt: -1 })
      .lean();
  }

  async markCommissionPaid(commId: string) {
    const comm = await this.commModel.findByIdAndUpdate(
      commId,
      { status: CommissionStatus.PAID, paidAt: new Date(), paymentMethod: 'manual_admin' },
      { new: true },
    );
    if (!comm) throw new NotFoundException('Commission record not found');

    const pending = await this.commModel.countDocuments({
      technician: comm.technician, status: CommissionStatus.PENDING,
    });
    if (pending === 0) {
      await this.techModel.findByIdAndUpdate(comm.technician, {
        isCommissionLocked: false, pendingCommission: 0,
      });
    }
    return { message: 'Commission marked as paid' };
  }
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard statistics' })
  getDashboard() { return this.adminService.getDashboardStats(); }

  @Get('technicians')
  @ApiOperation({ summary: 'List all technicians, filter by ?status=pending|approved|rejected|suspended' })
  getTechnicians(@Query('status') status?: string) {
    return this.adminService.getAllTechnicians(status);
  }

  @Get('technicians/:id')
  getTechnicianDetail(@Param('id') id: string) {
    return this.adminService.getTechnicianDetail(id);
  }

  @Patch('technicians/:id/approve')
  @ApiOperation({ summary: 'Approve a pending technician' })
  approveTechnician(@Param('id') id: string) {
    return this.adminService.approveTechnician(id);
  }

  @Patch('technicians/:id/reject')
  @ApiOperation({ summary: 'Reject a technician application' })
  rejectTechnician(@Param('id') id: string, @Body() dto: RejectTechDto) {
    return this.adminService.rejectTechnician(id, dto.reason);
  }

  @Patch('technicians/:id/suspend')
  @ApiOperation({ summary: 'Suspend a technician' })
  suspendTechnician(@Param('id') id: string) {
    return this.adminService.suspendTechnician(id);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users, filter by ?role=customer|technician' })
  getUsers(@Query('role') role?: string) {
    return this.adminService.getAllUsers(role);
  }

@Get('users/:id')
getUserDetail(@Param('id') id: string): Promise<any> {
  return this.adminService.getUserDetail(id);
}

  @Patch('users/:id/toggle')
  @ApiOperation({ summary: 'Activate or deactivate a user account' })
  toggleUser(@Param('id') id: string, @Body() dto: ToggleUserDto) {
    return this.adminService.toggleUserStatus(id, dto.action);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings, filter by ?status=' })
  getAllBookings(@Query('status') status?: string) {
    return this.adminService.getAllBookings(status);
  }

  @Patch('bookings/:id/cancel')
  @ApiOperation({ summary: 'Cancel any booking (admin override)' })
  cancelBooking(@Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.adminService.cancelBookingAdmin(id, dto.reason);
  }

  @Get('commissions')
  @ApiOperation({ summary: 'List all commission records, filter by ?status=pending|paid' })
  getCommissions(@Query('status') status?: string) {
    return this.adminService.getAllCommissions(status);
  }

  @Patch('commissions/:id/mark-paid')
  @ApiOperation({ summary: 'Manually mark a commission as paid' })
  markPaid(@Param('id') id: string) {
    return this.adminService.markCommissionPaid(id);
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name,       schema: UserSchema       },
      { name: Technician.name, schema: TechnicianSchema },
      { name: Booking.name,    schema: BookingSchema    },
      { name: Commission.name, schema: CommissionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}

// ─── commission.controller.ts + service + module ─────────────────────────────
import {
  Injectable, NotFoundException, ForbiddenException,
  Controller, Get, Post, Body, UseGuards, Request,
  Module,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional } from 'class-validator';
import { Commission, CommissionDocument, CommissionStatus, CommissionSchema } from './schemas/commission.schema';
import { Technician, TechnicianDocument, TechnicianSchema } from '../technicians/schemas/technician.schema';

class PayCommissionDto {
  @ApiProperty({ example: 'jazzcash', description: 'jazzcash | easypaisa | bank | cash' })
  @IsString() paymentMethod: string;
  @ApiPropertyOptional() @IsOptional() @IsString() transactionId?: string;
}

@Injectable()
export class CommissionService {
  constructor(
    @InjectModel(Commission.name) private commModel: Model<CommissionDocument>,
    @InjectModel(Technician.name) private techModel: Model<TechnicianDocument>,
  ) {}

  async getMyPending(techUserId: string) {
    const tech = await this.techModel.findOne({ user: techUserId });
    if (!tech) throw new NotFoundException('Technician profile not found');
    return this.commModel
      .find({ technician: tech._id, status: CommissionStatus.PENDING })
      .populate('booking', 'serviceType finalPrice confirmedAt')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getMyHistory(techUserId: string) {
    const tech = await this.techModel.findOne({ user: techUserId });
    if (!tech) throw new NotFoundException('Technician profile not found');
    return this.commModel
      .find({ technician: tech._id })
      .populate('booking', 'serviceType finalPrice confirmedAt')
      .sort({ createdAt: -1 })
      .lean();
  }

  async pay(techUserId: string, dto: PayCommissionDto) {
    const tech = await this.techModel.findOne({ user: techUserId });
    if (!tech) throw new NotFoundException('Technician profile not found');
    if (!tech.isCommissionLocked)
      throw new ForbiddenException('No pending commission found');

    await this.commModel.updateMany(
      { technician: tech._id, status: CommissionStatus.PENDING },
      { status: CommissionStatus.PAID, paidAt: new Date(), paymentMethod: dto.paymentMethod, transactionId: dto.transactionId },
    );

    await this.techModel.findByIdAndUpdate(tech._id, {
      isCommissionLocked: false, pendingCommission: 0,
    });

    return { message: 'Commission paid successfully. Your account is now unlocked.' };
  }

  async getAdminStats() {
    const stats = await this.commModel.aggregate([
      { $group: { _id: '$status', total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } },
    ]);
    const map: any = {};
    stats.forEach((s: any) => { map[s._id] = s; });
    return {
      pending: { total: map.pending?.total || 0, count: map.pending?.count || 0 },
      paid:    { total: map.paid?.total    || 0, count: map.paid?.count    || 0 },
    };
  }
}

@ApiTags('Commission')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('commission')
export class CommissionController {
  constructor(private svc: CommissionService) {}

  @Get('my/pending')
  @ApiOperation({ summary: 'Get my pending commissions (Technician)' })
  getMyPending(@Request() req: any) {
    return this.svc.getMyPending(req.user?.userId || req.user?.sub);
  }

  @Get('my/history')
  @ApiOperation({ summary: 'Get my full commission history (Technician)' })
  getMyHistory(@Request() req: any) {
    return this.svc.getMyHistory(req.user?.userId || req.user?.sub);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Pay pending commission (Technician)' })
  pay(@Request() req: any, @Body() dto: PayCommissionDto) {
    return this.svc.pay(req.user?.userId || req.user?.sub, dto);
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get commission statistics (Admin)' })
  adminStats() { return this.svc.getAdminStats(); }
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema },
      { name: Technician.name, schema: TechnicianSchema },
    ]),
  ],
  controllers: [CommissionController],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}

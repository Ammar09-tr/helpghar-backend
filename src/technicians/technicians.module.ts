import {
  Injectable, NotFoundException,
  Controller, Get, Patch, Body, Query, UseGuards, Request,
  Module,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Technician, TechnicianDocument, TechnicianSchema, TechnicianAvailability } from './schemas/technician.schema';

class UpdateAvailabilityDto {
  @ApiProperty({ enum: TechnicianAvailability }) @IsEnum(TechnicianAvailability)
  availability: TechnicianAvailability;
}

class UpdateLocationDto {
  @ApiProperty() @IsNumber() longitude: number;
  @ApiProperty() @IsNumber() latitude: number;
}

class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() bio?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() yearsOfExperience?: number;
}

@Injectable()
export class TechniciansService {
  constructor(@InjectModel(Technician.name) private techModel: Model<TechnicianDocument>) {}

  async getMyProfile(userId: string) {
    const tech = await this.techModel.findOne({ user: userId }).populate('user', 'fullName email phone profilePicture').lean();
    if (!tech) throw new NotFoundException('Technician profile not found');
    return tech;
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const tech = await this.techModel.findOne({ user: userId });
    if (!tech) throw new NotFoundException('Technician profile not found');
    if (tech.isCommissionLocked && dto.availability === TechnicianAvailability.ONLINE) {
      throw new Error('Pay your pending commission before going online');
    }
    return this.techModel.findByIdAndUpdate(
      tech._id, { availability: dto.availability }, { new: true },
    ).lean();
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const tech = await this.techModel.findOne({ user: userId });
    if (!tech) throw new NotFoundException('Technician profile not found');
    return this.techModel.findByIdAndUpdate(
      tech._id,
      { currentLocation: { type: 'Point', coordinates: [dto.longitude, dto.latitude], updatedAt: new Date() } },
      { new: true },
    ).lean();
  }

  async getNearby(serviceType: string, longitude: number, latitude: number, radius: number = 15) {
    return this.techModel
      .find({
        skill:        serviceType,
        availability: TechnicianAvailability.ONLINE,
        status:       'approved',
      })
      .populate('user', 'fullName phone profilePicture averageRating')
      .limit(20)
      .lean();
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const tech = await this.techModel.findOne({ user: userId });
    if (!tech) throw new NotFoundException('Technician profile not found');
    return this.techModel.findByIdAndUpdate(tech._id, dto, { new: true }).lean();
  }
}

@ApiTags('Technicians')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('technicians')
export class TechniciansController {
  constructor(private svc: TechniciansService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my technician profile' })
  getMyProfile(@Request() req: any) {
    return this.svc.getMyProfile(req.user?.userId || req.user?.sub);
  }

  @Patch('me/availability')
  @ApiOperation({ summary: 'Set availability (online/offline/busy)' })
  updateAvailability(@Request() req: any, @Body() dto: UpdateAvailabilityDto) {
    return this.svc.updateAvailability(req.user?.userId || req.user?.sub, dto);
  }

  @Patch('me/location')
  @ApiOperation({ summary: 'Update current GPS location' })
  updateLocation(@Request() req: any, @Body() dto: UpdateLocationDto) {
    return this.svc.updateLocation(req.user?.userId || req.user?.sub, dto);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update technician bio and experience' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.svc.updateProfile(req.user?.userId || req.user?.sub, dto);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby available technicians for a service type' })
  getNearby(
    @Query('serviceType') serviceType: string,
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
    @Query('radius') radius?: number,
  ) {
    return this.svc.getNearby(serviceType, Number(longitude), Number(latitude), Number(radius) || 15);
  }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: Technician.name, schema: TechnicianSchema }])],
  controllers: [TechniciansController],
  providers: [TechniciansService],
  exports: [TechniciansService],
})
export class TechniciansModule {}

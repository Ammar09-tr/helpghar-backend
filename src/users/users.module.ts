// ─── Users Module ─────────────────────────────────────────────────────────────
import {
  Injectable, NotFoundException,
  Controller, Get, Patch, Body, UseGuards, Request,
  Module,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsOptional, IsString } from 'class-validator';
import { User, UserDocument, UserSchema } from './schemas/user.schema';

class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fullName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updates: any = {};
    if (dto.fullName) updates.fullName = dto.fullName.trim();
    if (dto.phone)    updates.phone    = dto.phone.trim();
    return this.userModel.findByIdAndUpdate(userId, updates, { new: true }).lean();
  }
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user?.userId || req.user?.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user?.userId || req.user?.sub, dto);
  }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

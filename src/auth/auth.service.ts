import {
  Injectable, BadRequestException, UnauthorizedException, ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Technician, TechnicianDocument, TechnicianStatus } from '../technicians/schemas/technician.schema';
import {
  RegisterCustomerDto, RegisterTechnicianDto,
  LoginDto, RegisterAdminDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)       private userModel: Model<UserDocument>,
    @InjectModel(Technician.name) private techModel: Model<TechnicianDocument>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private generateToken(user: UserDocument) {
    const payload = {
      sub:    user._id.toString(),
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id:          user._id,
        fullName:     user.fullName,
        email:        user.email,
        phone:        user.phone,
        role:         user.role,
        profilePicture: user.profilePicture,
      },
    };
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    const existing = await this.userModel.findOne({
      $or: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }],
    });
    if (existing) throw new BadRequestException('Email or phone is already registered');

    const hashed = await this.hashPassword(dto.password);
    const user = await this.userModel.create({
      ...dto,
      email:    dto.email.toLowerCase().trim(),
      password: hashed,
      role:     UserRole.CUSTOMER,
    });

    return this.generateToken(user);
  }

  async registerTechnician(dto: RegisterTechnicianDto) {
    // CNIC is mandatory
    if (!dto.cnic || !dto.cnic.trim()) {
      throw new BadRequestException('CNIC is mandatory for technician registration');
    }

    const existing = await this.userModel.findOne({
      $or: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }],
    });
    if (existing) throw new BadRequestException('Email or phone is already registered');

    const hashed = await this.hashPassword(dto.password);
    const user = await this.userModel.create({
      fullName: dto.fullName.trim(),
      email:    dto.email.toLowerCase().trim(),
      phone:    dto.phone.trim(),
      password: hashed,
      role:     UserRole.TECHNICIAN,
    });

    await this.techModel.create({
      user:               user._id,
      skill:              dto.skill,
      cnic:               dto.cnic.trim(),
      yearsOfExperience:  dto.yearsOfExperience || 0,
      bio:                dto.bio?.trim(),
    });

    return {
      message: 'Technician registration submitted successfully. Your account will be activated after admin verification of your CNIC and credentials.',
      userId:  user._id,
    };
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const adminKey = this.config.get<string>('ADMIN_SECRET_KEY');
    if (dto.secretKey !== adminKey) {
      throw new ForbiddenException('Invalid admin secret key');
    }

    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new BadRequestException('Email already registered');

    const hashed = await this.hashPassword(dto.password);
    const user = await this.userModel.create({
      fullName: dto.fullName.trim(),
      email:    dto.email.toLowerCase().trim(),
      phone:    dto.phone.trim(),
      password: hashed,
      role:     UserRole.ADMIN,
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase().trim() })
      .select('+password');
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    if (!user.isActive) {
      throw new ForbiddenException('Your account has been deactivated. Please contact support.');
    }

    if (user.role === UserRole.TECHNICIAN) {
      const tech = await this.techModel.findOne({ user: user._id });
      if (tech?.status === TechnicianStatus.PENDING) {
        throw new ForbiddenException('Your technician account is pending admin approval. You will be notified once verified.');
      }
      if (tech?.status === TechnicianStatus.REJECTED) {
        throw new ForbiddenException(`Your technician application was rejected. ${tech.rejectionReason || 'Contact support for details.'}`);
      }
      if (tech?.status === TechnicianStatus.SUSPENDED) {
        throw new ForbiddenException('Your account has been suspended. Please contact admin support.');
      }
    }

    return this.generateToken(user);
  }

  async getMe(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new UnauthorizedException('User not found');

    if (user.role === UserRole.TECHNICIAN) {
      const tech = await this.techModel.findOne({ user: userId }).lean();
      return { ...user, technicianProfile: tech };
    }

    return user;
  }
}

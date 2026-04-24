import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDocument, UserRole } from '../users/schemas/user.schema';
import { TechnicianDocument } from '../technicians/schemas/technician.schema';
import { RegisterCustomerDto, RegisterTechnicianDto, LoginDto, RegisterAdminDto } from './dto/auth.dto';
export declare class AuthService {
    private userModel;
    private techModel;
    private jwtService;
    private config;
    constructor(userModel: Model<UserDocument>, techModel: Model<TechnicianDocument>, jwtService: JwtService, config: ConfigService);
    private hashPassword;
    private generateToken;
    registerCustomer(dto: RegisterCustomerDto): Promise<{
        access_token: string;
        user: {
            _id: import("mongoose").Types.ObjectId;
            fullName: string;
            email: string;
            phone: string;
            role: UserRole;
            profilePicture: string;
        };
    }>;
    registerTechnician(dto: RegisterTechnicianDto): Promise<{
        message: string;
        userId: import("mongoose").Types.ObjectId;
    }>;
    registerAdmin(dto: RegisterAdminDto): Promise<{
        access_token: string;
        user: {
            _id: import("mongoose").Types.ObjectId;
            fullName: string;
            email: string;
            phone: string;
            role: UserRole;
            profilePicture: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            _id: import("mongoose").Types.ObjectId;
            fullName: string;
            email: string;
            phone: string;
            role: UserRole;
            profilePicture: string;
        };
    }>;
    getMe(userId: string): Promise<any>;
}

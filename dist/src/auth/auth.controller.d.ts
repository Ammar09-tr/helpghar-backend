import { AuthService } from './auth.service';
import { RegisterCustomerDto, RegisterTechnicianDto, LoginDto, RegisterAdminDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    registerCustomer(dto: RegisterCustomerDto): Promise<{
        access_token: string;
        user: {
            _id: import("mongoose").Types.ObjectId;
            fullName: string;
            email: string;
            phone: string;
            role: import("../users/schemas/user.schema").UserRole;
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
            role: import("../users/schemas/user.schema").UserRole;
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
            role: import("../users/schemas/user.schema").UserRole;
            profilePicture: string;
        };
    }>;
    getMe(req: any): Promise<any>;
}

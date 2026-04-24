import { ServiceType } from '../../technicians/schemas/technician.schema';
export declare class RegisterCustomerDto {
    fullName: string;
    email: string;
    phone: string;
    password: string;
}
export declare class RegisterTechnicianDto extends RegisterCustomerDto {
    cnic: string;
    skill: ServiceType;
    yearsOfExperience?: number;
    bio?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterAdminDto extends RegisterCustomerDto {
    secretKey: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}

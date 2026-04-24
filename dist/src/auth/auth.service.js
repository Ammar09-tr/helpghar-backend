"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("../users/schemas/user.schema");
const technician_schema_1 = require("../technicians/schemas/technician.schema");
let AuthService = class AuthService {
    constructor(userModel, techModel, jwtService, config) {
        this.userModel = userModel;
        this.techModel = techModel;
        this.jwtService = jwtService;
        this.config = config;
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }
    generateToken(user) {
        const payload = {
            sub: user._id.toString(),
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        };
    }
    async registerCustomer(dto) {
        const existing = await this.userModel.findOne({
            $or: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }],
        });
        if (existing)
            throw new common_1.BadRequestException('Email or phone is already registered');
        const hashed = await this.hashPassword(dto.password);
        const user = await this.userModel.create({
            ...dto,
            email: dto.email.toLowerCase().trim(),
            password: hashed,
            role: user_schema_1.UserRole.CUSTOMER,
        });
        return this.generateToken(user);
    }
    async registerTechnician(dto) {
        if (!dto.cnic || !dto.cnic.trim()) {
            throw new common_1.BadRequestException('CNIC is mandatory for technician registration');
        }
        const existing = await this.userModel.findOne({
            $or: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }],
        });
        if (existing)
            throw new common_1.BadRequestException('Email or phone is already registered');
        const hashed = await this.hashPassword(dto.password);
        const user = await this.userModel.create({
            fullName: dto.fullName.trim(),
            email: dto.email.toLowerCase().trim(),
            phone: dto.phone.trim(),
            password: hashed,
            role: user_schema_1.UserRole.TECHNICIAN,
        });
        await this.techModel.create({
            user: user._id,
            skill: dto.skill,
            cnic: dto.cnic.trim(),
            yearsOfExperience: dto.yearsOfExperience || 0,
            bio: dto.bio?.trim(),
        });
        return {
            message: 'Technician registration submitted successfully. Your account will be activated after admin verification of your CNIC and credentials.',
            userId: user._id,
        };
    }
    async registerAdmin(dto) {
        const adminKey = this.config.get('ADMIN_SECRET_KEY');
        if (dto.secretKey !== adminKey) {
            throw new common_1.ForbiddenException('Invalid admin secret key');
        }
        const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (existing)
            throw new common_1.BadRequestException('Email already registered');
        const hashed = await this.hashPassword(dto.password);
        const user = await this.userModel.create({
            fullName: dto.fullName.trim(),
            email: dto.email.toLowerCase().trim(),
            phone: dto.phone.trim(),
            password: hashed,
            role: user_schema_1.UserRole.ADMIN,
        });
        return this.generateToken(user);
    }
    async login(dto) {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase().trim() })
            .select('+password');
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Your account has been deactivated. Please contact support.');
        }
        if (user.role === user_schema_1.UserRole.TECHNICIAN) {
            const tech = await this.techModel.findOne({ user: user._id });
            if (tech?.status === technician_schema_1.TechnicianStatus.PENDING) {
                throw new common_1.ForbiddenException('Your technician account is pending admin approval. You will be notified once verified.');
            }
            if (tech?.status === technician_schema_1.TechnicianStatus.REJECTED) {
                throw new common_1.ForbiddenException(`Your technician application was rejected. ${tech.rejectionReason || 'Contact support for details.'}`);
            }
            if (tech?.status === technician_schema_1.TechnicianStatus.SUSPENDED) {
                throw new common_1.ForbiddenException('Your account has been suspended. Please contact admin support.');
            }
        }
        return this.generateToken(user);
    }
    async getMe(userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        if (user.role === user_schema_1.UserRole.TECHNICIAN) {
            const tech = await this.techModel.findOne({ user: userId }).lean();
            return { ...user, technicianProfile: tech };
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(technician_schema_1.Technician.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
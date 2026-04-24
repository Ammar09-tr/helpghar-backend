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
exports.TechniciansModule = exports.TechniciansController = exports.TechniciansService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const mongoose_3 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const class_validator_1 = require("class-validator");
const technician_schema_1 = require("./schemas/technician.schema");
class UpdateAvailabilityDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: technician_schema_1.TechnicianAvailability }),
    (0, class_validator_1.IsEnum)(technician_schema_1.TechnicianAvailability),
    __metadata("design:type", String)
], UpdateAvailabilityDto.prototype, "availability", void 0);
class UpdateLocationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "latitude", void 0);
class UpdateProfileDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "yearsOfExperience", void 0);
let TechniciansService = class TechniciansService {
    constructor(techModel) {
        this.techModel = techModel;
    }
    async getMyProfile(userId) {
        const tech = await this.techModel.findOne({ user: userId }).populate('user', 'fullName email phone profilePicture').lean();
        if (!tech)
            throw new common_1.NotFoundException('Technician profile not found');
        return tech;
    }
    async updateAvailability(userId, dto) {
        const tech = await this.techModel.findOne({ user: userId });
        if (!tech)
            throw new common_1.NotFoundException('Technician profile not found');
        if (tech.isCommissionLocked && dto.availability === technician_schema_1.TechnicianAvailability.ONLINE) {
            throw new Error('Pay your pending commission before going online');
        }
        return this.techModel.findByIdAndUpdate(tech._id, { availability: dto.availability }, { new: true }).lean();
    }
    async updateLocation(userId, dto) {
        const tech = await this.techModel.findOne({ user: userId });
        if (!tech)
            throw new common_1.NotFoundException('Technician profile not found');
        return this.techModel.findByIdAndUpdate(tech._id, { currentLocation: { type: 'Point', coordinates: [dto.longitude, dto.latitude], updatedAt: new Date() } }, { new: true }).lean();
    }
    async getNearby(serviceType, longitude, latitude, radius = 15) {
        return this.techModel
            .find({
            skill: serviceType,
            availability: technician_schema_1.TechnicianAvailability.ONLINE,
            status: 'approved',
        })
            .populate('user', 'fullName phone profilePicture averageRating')
            .limit(20)
            .lean();
    }
    async updateProfile(userId, dto) {
        const tech = await this.techModel.findOne({ user: userId });
        if (!tech)
            throw new common_1.NotFoundException('Technician profile not found');
        return this.techModel.findByIdAndUpdate(tech._id, dto, { new: true }).lean();
    }
};
exports.TechniciansService = TechniciansService;
exports.TechniciansService = TechniciansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(technician_schema_1.Technician.name)),
    __metadata("design:paramtypes", [mongoose_3.Model])
], TechniciansService);
let TechniciansController = class TechniciansController {
    constructor(svc) {
        this.svc = svc;
    }
    getMyProfile(req) {
        return this.svc.getMyProfile(req.user?.userId || req.user?.sub);
    }
    updateAvailability(req, dto) {
        return this.svc.updateAvailability(req.user?.userId || req.user?.sub, dto);
    }
    updateLocation(req, dto) {
        return this.svc.updateLocation(req.user?.userId || req.user?.sub, dto);
    }
    updateProfile(req, dto) {
        return this.svc.updateProfile(req.user?.userId || req.user?.sub, dto);
    }
    getNearby(serviceType, longitude, latitude, radius) {
        return this.svc.getNearby(serviceType, Number(longitude), Number(latitude), Number(radius) || 15);
    }
};
exports.TechniciansController = TechniciansController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my technician profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me/availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Set availability (online/offline/busy)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateAvailabilityDto]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Patch)('me/location'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current GPS location' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateLocationDto]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Patch)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update technician bio and experience' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Get nearby available technicians for a service type' }),
    __param(0, (0, common_1.Query)('serviceType')),
    __param(1, (0, common_1.Query)('longitude')),
    __param(2, (0, common_1.Query)('latitude')),
    __param(3, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number]),
    __metadata("design:returntype", void 0)
], TechniciansController.prototype, "getNearby", null);
exports.TechniciansController = TechniciansController = __decorate([
    (0, swagger_1.ApiTags)('Technicians'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('technicians'),
    __metadata("design:paramtypes", [TechniciansService])
], TechniciansController);
let TechniciansModule = class TechniciansModule {
};
exports.TechniciansModule = TechniciansModule;
exports.TechniciansModule = TechniciansModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_2.MongooseModule.forFeature([{ name: technician_schema_1.Technician.name, schema: technician_schema_1.TechnicianSchema }])],
        controllers: [TechniciansController],
        providers: [TechniciansService],
        exports: [TechniciansService],
    })
], TechniciansModule);
//# sourceMappingURL=technicians.module.js.map
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
exports.CommissionModule = exports.CommissionController = exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const mongoose_3 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const class_validator_1 = require("class-validator");
const commission_schema_1 = require("./schemas/commission.schema");
const technician_schema_1 = require("../technicians/schemas/technician.schema");
class PayCommissionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'jazzcash', description: 'jazzcash | easypaisa | bank | cash' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayCommissionDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayCommissionDto.prototype, "transactionId", void 0);
let CommissionService = class CommissionService {
    constructor(commModel, techModel) {
        this.commModel = commModel;
        this.techModel = techModel;
    }
    async getMyPending(techUserId) {
        const tech = await this.techModel.findOne({ user: techUserId });
        if (!tech)
            throw new common_1.NotFoundException('Technician profile not found');
        return this.commModel
            .find({ technician: tech._id, status: commission_schema_1.CommissionStatus.PENDING })
            .populate('booking', 'serviceType finalPrice confirmedAt')
            .sort({ createdAt: -1 })
            .lean();
    }
    async getMyHistory(techUserId) {
        const tech = await this.techModel.findOne({ user: techUserId });
        if (!tech)
            throw new common_1.NotFoundException('Technician profile not found');
        return this.commModel
            .find({ technician: tech._id })
            .populate('booking', 'serviceType finalPrice confirmedAt')
            .sort({ createdAt: -1 })
            .lean();
    }
    async pay(techUserId, dto) {
        const tech = await this.techModel.findOne({ user: techUserId });
        if (!tech)
            throw new common_1.NotFoundException('Technician profile not found');
        if (!tech.isCommissionLocked)
            throw new common_1.ForbiddenException('No pending commission found');
        await this.commModel.updateMany({ technician: tech._id, status: commission_schema_1.CommissionStatus.PENDING }, { status: commission_schema_1.CommissionStatus.PAID, paidAt: new Date(), paymentMethod: dto.paymentMethod, transactionId: dto.transactionId });
        await this.techModel.findByIdAndUpdate(tech._id, {
            isCommissionLocked: false, pendingCommission: 0,
        });
        return { message: 'Commission paid successfully. Your account is now unlocked.' };
    }
    async getAdminStats() {
        const stats = await this.commModel.aggregate([
            { $group: { _id: '$status', total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } },
        ]);
        const map = {};
        stats.forEach((s) => { map[s._id] = s; });
        return {
            pending: { total: map.pending?.total || 0, count: map.pending?.count || 0 },
            paid: { total: map.paid?.total || 0, count: map.paid?.count || 0 },
        };
    }
};
exports.CommissionService = CommissionService;
exports.CommissionService = CommissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(commission_schema_1.Commission.name)),
    __param(1, (0, mongoose_1.InjectModel)(technician_schema_1.Technician.name)),
    __metadata("design:paramtypes", [mongoose_3.Model,
        mongoose_3.Model])
], CommissionService);
let CommissionController = class CommissionController {
    constructor(svc) {
        this.svc = svc;
    }
    getMyPending(req) {
        return this.svc.getMyPending(req.user?.userId || req.user?.sub);
    }
    getMyHistory(req) {
        return this.svc.getMyHistory(req.user?.userId || req.user?.sub);
    }
    pay(req, dto) {
        return this.svc.pay(req.user?.userId || req.user?.sub, dto);
    }
    adminStats() { return this.svc.getAdminStats(); }
};
exports.CommissionController = CommissionController;
__decorate([
    (0, common_1.Get)('my/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my pending commissions (Technician)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommissionController.prototype, "getMyPending", null);
__decorate([
    (0, common_1.Get)('my/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my full commission history (Technician)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommissionController.prototype, "getMyHistory", null);
__decorate([
    (0, common_1.Post)('pay'),
    (0, swagger_1.ApiOperation)({ summary: 'Pay pending commission (Technician)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, PayCommissionDto]),
    __metadata("design:returntype", void 0)
], CommissionController.prototype, "pay", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get commission statistics (Admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommissionController.prototype, "adminStats", null);
exports.CommissionController = CommissionController = __decorate([
    (0, swagger_1.ApiTags)('Commission'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('commission'),
    __metadata("design:paramtypes", [CommissionService])
], CommissionController);
let CommissionModule = class CommissionModule {
};
exports.CommissionModule = CommissionModule;
exports.CommissionModule = CommissionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_2.MongooseModule.forFeature([
                { name: commission_schema_1.Commission.name, schema: commission_schema_1.CommissionSchema },
                { name: technician_schema_1.Technician.name, schema: technician_schema_1.TechnicianSchema },
            ]),
        ],
        controllers: [CommissionController],
        providers: [CommissionService],
        exports: [CommissionService],
    })
], CommissionModule);
//# sourceMappingURL=commission.module.js.map
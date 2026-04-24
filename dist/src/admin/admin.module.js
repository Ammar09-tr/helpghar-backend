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
exports.AdminModule = exports.AdminController = exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const mongoose_3 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const class_validator_1 = require("class-validator");
const user_schema_1 = require("../users/schemas/user.schema");
const technician_schema_1 = require("../technicians/schemas/technician.schema");
const booking_schema_1 = require("../bookings/schemas/booking.schema");
const commission_schema_1 = require("../commission/schemas/commission.schema");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const notifications_module_1 = require("../notifications/notifications.module");
const roles_guard_1 = require("../common/guards/roles.guard");
class RejectTechDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectTechDto.prototype, "reason", void 0);
class CancelBookingDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CancelBookingDto.prototype, "reason", void 0);
class ToggleUserDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ToggleUserDto.prototype, "action", void 0);
let AdminService = class AdminService {
    constructor(userModel, techModel, bookingModel, commModel, notificationsGateway) {
        this.userModel = userModel;
        this.techModel = techModel;
        this.bookingModel = bookingModel;
        this.commModel = commModel;
        this.notificationsGateway = notificationsGateway;
    }
    async getDashboardStats() {
        const [totalCustomers, totalTechs, pendingTechs, approvedTechs, totalBookings, activeBookings, completedBookings, totalUsers, commStats,] = await Promise.all([
            this.userModel.countDocuments({ role: user_schema_1.UserRole.CUSTOMER }),
            this.techModel.countDocuments(),
            this.techModel.countDocuments({ status: technician_schema_1.TechnicianStatus.PENDING }),
            this.techModel.countDocuments({ status: technician_schema_1.TechnicianStatus.APPROVED }),
            this.bookingModel.countDocuments(),
            this.bookingModel.countDocuments({ status: { $in: [booking_schema_1.BookingStatus.ACCEPTED, booking_schema_1.BookingStatus.EN_ROUTE, booking_schema_1.BookingStatus.IN_PROGRESS] } }),
            this.bookingModel.countDocuments({ status: booking_schema_1.BookingStatus.CONFIRMED }),
            this.userModel.countDocuments(),
            this.commModel.aggregate([{ $group: { _id: '$status', total: { $sum: '$commissionAmount' }, count: { $sum: 1 } } }]),
        ]);
        const cm = {};
        commStats.forEach((s) => { cm[s._id] = s; });
        return {
            users: { total: totalUsers, customers: totalCustomers },
            technicians: { total: totalTechs, pending: pendingTechs, approved: approvedTechs },
            bookings: { total: totalBookings, active: activeBookings, completed: completedBookings },
            commission: {
                pending: { total: cm.pending?.total || 0, count: cm.pending?.count || 0 },
                paid: { total: cm.paid?.total || 0, count: cm.paid?.count || 0 },
            },
        };
    }
    async getAllTechnicians(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.techModel
            .find(filter)
            .populate('user', 'fullName email phone createdAt isActive profilePicture')
            .sort({ createdAt: -1 })
            .lean();
    }
    async getTechnicianDetail(techId) {
        const tech = await this.techModel
            .findById(techId)
            .populate('user', 'fullName email phone createdAt isActive profilePicture')
            .lean();
        if (!tech)
            throw new common_1.NotFoundException('Technician not found');
        return tech;
    }
    async approveTechnician(techId) {
        const tech = await this.techModel.findById(techId);
        if (!tech)
            throw new common_1.NotFoundException('Technician not found');
        if (tech.status !== technician_schema_1.TechnicianStatus.PENDING)
            throw new common_1.BadRequestException('Technician is not in pending state');
        tech.status = technician_schema_1.TechnicianStatus.APPROVED;
        await tech.save();
        this.notificationsGateway.notifyUser(tech.user.toString(), 'account:approved', {
            message: 'Your technician account has been approved! You can now go online and accept jobs.',
        });
        return { message: 'Technician approved successfully' };
    }
    async rejectTechnician(techId, reason) {
        const tech = await this.techModel.findById(techId);
        if (!tech)
            throw new common_1.NotFoundException('Technician not found');
        tech.status = technician_schema_1.TechnicianStatus.REJECTED;
        tech.rejectionReason = reason;
        await tech.save();
        this.notificationsGateway.notifyUser(tech.user.toString(), 'account:rejected', {
            message: `Your technician application was rejected. ${reason || ''}`.trim(),
        });
        return { message: 'Technician rejected' };
    }
    async suspendTechnician(techId) {
        const tech = await this.techModel.findByIdAndUpdate(techId, { status: technician_schema_1.TechnicianStatus.SUSPENDED }, { new: true });
        if (!tech)
            throw new common_1.NotFoundException('Technician not found');
        await this.userModel.findByIdAndUpdate(tech.user, { isActive: false });
        this.notificationsGateway.notifyUser(tech.user.toString(), 'account:suspended', {
            message: 'Your account has been suspended. Please contact admin support.',
        });
        return { message: 'Technician suspended' };
    }
    async getAllUsers(role) {
        const filter = { role: { $ne: user_schema_1.UserRole.ADMIN } };
        if (role)
            filter.role = role;
        return this.userModel.find(filter).sort({ createdAt: -1 }).lean();
    }
    async getUserDetail(userId) {
        const user = await this.userModel.findById(userId).lean();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const tech = user.role === user_schema_1.UserRole.TECHNICIAN
            ? await this.techModel.findOne({ user: userId }).lean()
            : null;
        const bookings = await this.bookingModel.find({ customer: userId }).countDocuments();
        return { ...user, technicianProfile: tech, totalBookings: bookings };
    }
    async toggleUserStatus(userId, action) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === user_schema_1.UserRole.ADMIN)
            throw new common_1.BadRequestException('Cannot modify admin account');
        const isActive = action === 'activate';
        await this.userModel.findByIdAndUpdate(userId, { isActive });
        this.notificationsGateway.notifyUser(userId, isActive ? 'account:activated' : 'account:deactivated', {
            message: isActive
                ? 'Your account has been reactivated. Welcome back!'
                : 'Your account has been deactivated. Contact support for assistance.',
        });
        return { message: `User ${isActive ? 'activated' : 'deactivated'} successfully` };
    }
    async getAllBookings(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.bookingModel
            .find(filter)
            .populate('customer', 'fullName phone')
            .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone' } })
            .sort({ createdAt: -1 })
            .lean();
    }
    async cancelBookingAdmin(bookingId, reason) {
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if ([booking_schema_1.BookingStatus.CONFIRMED, booking_schema_1.BookingStatus.CANCELLED].includes(booking.status))
            throw new common_1.BadRequestException('Cannot cancel a completed or already cancelled booking');
        booking.status = booking_schema_1.BookingStatus.CANCELLED;
        booking.cancellationReason = reason;
        booking.cancelledBy = 'admin';
        await booking.save();
        this.notificationsGateway.notifyUser(booking.customer.toString(), 'booking:cancelled_admin', {
            message: `Your booking was cancelled by admin. Reason: ${reason}`,
        });
        if (booking.technician) {
            this.notificationsGateway.notifyUser(booking.technician.toString(), 'booking:cancelled_admin', {
                message: `Booking cancelled by admin. Reason: ${reason}`,
            });
        }
        return { message: 'Booking cancelled by admin' };
    }
    async getAllCommissions(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.commModel
            .find(filter)
            .populate({ path: 'technician', populate: { path: 'user', select: 'fullName phone' } })
            .populate('booking', 'serviceType finalPrice createdAt')
            .sort({ createdAt: -1 })
            .lean();
    }
    async markCommissionPaid(commId) {
        const comm = await this.commModel.findByIdAndUpdate(commId, { status: commission_schema_1.CommissionStatus.PAID, paidAt: new Date(), paymentMethod: 'manual_admin' }, { new: true });
        if (!comm)
            throw new common_1.NotFoundException('Commission record not found');
        const pending = await this.commModel.countDocuments({
            technician: comm.technician, status: commission_schema_1.CommissionStatus.PENDING,
        });
        if (pending === 0) {
            await this.techModel.findByIdAndUpdate(comm.technician, {
                isCommissionLocked: false, pendingCommission: 0,
            });
        }
        return { message: 'Commission marked as paid' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(technician_schema_1.Technician.name)),
    __param(2, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(3, (0, mongoose_1.InjectModel)(commission_schema_1.Commission.name)),
    __metadata("design:paramtypes", [mongoose_3.Model,
        mongoose_3.Model,
        mongoose_3.Model,
        mongoose_3.Model,
        notifications_gateway_1.NotificationsGateway])
], AdminService);
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getDashboard() { return this.adminService.getDashboardStats(); }
    getTechnicians(status) {
        return this.adminService.getAllTechnicians(status);
    }
    getTechnicianDetail(id) {
        return this.adminService.getTechnicianDetail(id);
    }
    approveTechnician(id) {
        return this.adminService.approveTechnician(id);
    }
    rejectTechnician(id, dto) {
        return this.adminService.rejectTechnician(id, dto.reason);
    }
    suspendTechnician(id) {
        return this.adminService.suspendTechnician(id);
    }
    getUsers(role) {
        return this.adminService.getAllUsers(role);
    }
    getUserDetail(id) {
        return this.adminService.getUserDetail(id);
    }
    toggleUser(id, dto) {
        return this.adminService.toggleUserStatus(id, dto.action);
    }
    getAllBookings(status) {
        return this.adminService.getAllBookings(status);
    }
    cancelBooking(id, dto) {
        return this.adminService.cancelBookingAdmin(id, dto.reason);
    }
    getCommissions(status) {
        return this.adminService.getAllCommissions(status);
    }
    markPaid(id) {
        return this.adminService.markCommissionPaid(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('technicians'),
    (0, swagger_1.ApiOperation)({ summary: 'List all technicians, filter by ?status=pending|approved|rejected|suspended' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTechnicians", null);
__decorate([
    (0, common_1.Get)('technicians/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTechnicianDetail", null);
__decorate([
    (0, common_1.Patch)('technicians/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a pending technician' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveTechnician", null);
__decorate([
    (0, common_1.Patch)('technicians/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a technician application' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RejectTechDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectTechnician", null);
__decorate([
    (0, common_1.Patch)('technicians/:id/suspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend a technician' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "suspendTechnician", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users, filter by ?role=customer|technician' }),
    __param(0, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Patch)('users/:id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate or deactivate a user account' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ToggleUserDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleUser", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'List all bookings, filter by ?status=' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllBookings", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel any booking (admin override)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CancelBookingDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "cancelBooking", null);
__decorate([
    (0, common_1.Get)('commissions'),
    (0, swagger_1.ApiOperation)({ summary: 'List all commission records, filter by ?status=pending|paid' }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCommissions", null);
__decorate([
    (0, common_1.Patch)('commissions/:id/mark-paid'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually mark a commission as paid' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "markPaid", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('admin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [AdminService])
], AdminController);
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_2.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: technician_schema_1.Technician.name, schema: technician_schema_1.TechnicianSchema },
                { name: booking_schema_1.Booking.name, schema: booking_schema_1.BookingSchema },
                { name: commission_schema_1.Commission.name, schema: commission_schema_1.CommissionSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [AdminController],
        providers: [AdminService, roles_guard_1.RolesGuard],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map
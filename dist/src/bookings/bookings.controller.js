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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const bookings_service_1 = require("./bookings.service");
const booking_dto_1 = require("./dto/booking.dto");
const uid = (req) => req.user?.userId || req.user?.sub || req.user?._id;
let BookingsController = class BookingsController {
    constructor(svc) {
        this.svc = svc;
    }
    create(req, dto) {
        return this.svc.createBooking(uid(req), dto);
    }
    getMyBookings(req, status) {
        return this.svc.getMyBookings(uid(req), status);
    }
    getNearby(req, radius) {
        return this.svc.getNearbyPending(uid(req), radius ? Number(radius) : 50);
    }
    getMyJobs(req, status) {
        return this.svc.getMyJobs(uid(req), status);
    }
    getById(id, req) {
        return this.svc.getBookingById(id, uid(req));
    }
    submitOffer(req, id, dto) {
        return this.svc.submitOffer(uid(req), id, dto);
    }
    getOffers(id, req) {
        return this.svc.getOffers(id, uid(req));
    }
    selectOffer(req, id, dto) {
        return this.svc.selectOffer(uid(req), id, dto);
    }
    accept(req, id) {
        return this.svc.acceptBooking(uid(req), id);
    }
    reject(req, id) {
        return this.svc.rejectBooking(uid(req), id);
    }
    setPrice(req, id, dto) {
        return this.svc.setPrice(uid(req), id, dto);
    }
    startJob(req, id) {
        return this.svc.startJob(uid(req), id);
    }
    completeJob(req, id) {
        return this.svc.completeJob(uid(req), id);
    }
    confirm(req, id, dto) {
        return this.svc.confirmCompletion(uid(req), id, dto);
    }
    cancel(req, id, dto) {
        return this.svc.cancelBooking(uid(req), id, dto.reason);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a service booking request (Customer)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my bookings (Customer)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getMyBookings", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Get nearby pending bookings (Technician)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getNearby", null);
__decorate([
    (0, common_1.Get)('tech/my-jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my assigned jobs (Technician)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getMyJobs", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/offer'),
    (0, swagger_1.ApiOperation)({ summary: 'Technician submits a price offer (inDrive model)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.SubmitOfferDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "submitOffer", null);
__decorate([
    (0, common_1.Get)(':id/offers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all offers for a booking (Customer)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getOffers", null);
__decorate([
    (0, common_1.Patch)(':id/select-offer'),
    (0, swagger_1.ApiOperation)({ summary: 'Customer selects a technician offer' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.SelectOfferDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "selectOffer", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/set-price'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.SetPriceDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "setPrice", null);
__decorate([
    (0, common_1.Patch)(':id/start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "startJob", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "completeJob", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.ConfirmCompletionDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, booking_dto_1.CancelBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "cancel", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map
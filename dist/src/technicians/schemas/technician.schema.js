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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianSchema = exports.Technician = exports.TechnicianAvailability = exports.TechnicianStatus = exports.ServiceType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ServiceType;
(function (ServiceType) {
    ServiceType["ELECTRICIAN"] = "electrician";
    ServiceType["PLUMBER"] = "plumber";
    ServiceType["AC_TECHNICIAN"] = "ac_technician";
    ServiceType["PAINTER"] = "painter";
    ServiceType["CARPENTER"] = "carpenter";
    ServiceType["CLEANER"] = "cleaner";
    ServiceType["WELDER"] = "welder";
    ServiceType["OTHER"] = "other";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var TechnicianStatus;
(function (TechnicianStatus) {
    TechnicianStatus["PENDING"] = "pending";
    TechnicianStatus["APPROVED"] = "approved";
    TechnicianStatus["REJECTED"] = "rejected";
    TechnicianStatus["SUSPENDED"] = "suspended";
})(TechnicianStatus || (exports.TechnicianStatus = TechnicianStatus = {}));
var TechnicianAvailability;
(function (TechnicianAvailability) {
    TechnicianAvailability["ONLINE"] = "online";
    TechnicianAvailability["OFFLINE"] = "offline";
    TechnicianAvailability["BUSY"] = "busy";
})(TechnicianAvailability || (exports.TechnicianAvailability = TechnicianAvailability = {}));
let Technician = class Technician {
};
exports.Technician = Technician;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Technician.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ServiceType, required: true }),
    __metadata("design:type", String)
], Technician.prototype, "skill", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Technician.prototype, "cnic", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Technician.prototype, "cnicFrontImage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Technician.prototype, "cnicBackImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: TechnicianStatus, default: TechnicianStatus.PENDING }),
    __metadata("design:type", String)
], Technician.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Technician.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: TechnicianAvailability, default: TechnicianAvailability.OFFLINE }),
    __metadata("design:type", String)
], Technician.prototype, "availability", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Technician.prototype, "isCommissionLocked", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Technician.prototype, "pendingCommission", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Technician.prototype, "totalEarnings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Technician.prototype, "totalJobs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Technician.prototype, "averageRating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Technician.prototype, "totalRatings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Technician.prototype, "currentLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Booking', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Technician.prototype, "activeBooking", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Technician.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Technician.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], Technician.prototype, "certificationImages", void 0);
exports.Technician = Technician = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Technician);
exports.TechnicianSchema = mongoose_1.SchemaFactory.createForClass(Technician);
exports.TechnicianSchema.index({ currentLocation: '2dsphere' });
exports.TechnicianSchema.index({ skill: 1, availability: 1, status: 1 });
//# sourceMappingURL=technician.schema.js.map
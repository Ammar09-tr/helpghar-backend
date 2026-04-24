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
exports.CommissionSchema = exports.Commission = exports.CommissionStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var CommissionStatus;
(function (CommissionStatus) {
    CommissionStatus["PENDING"] = "pending";
    CommissionStatus["PAID"] = "paid";
})(CommissionStatus || (exports.CommissionStatus = CommissionStatus = {}));
let Commission = class Commission {
};
exports.Commission = Commission;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Technician', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Commission.prototype, "technician", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Booking', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Commission.prototype, "booking", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Commission.prototype, "jobPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Commission.prototype, "commissionRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Commission.prototype, "commissionAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: CommissionStatus, default: CommissionStatus.PENDING }),
    __metadata("design:type", String)
], Commission.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Commission.prototype, "paidAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Commission.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Commission.prototype, "transactionId", void 0);
exports.Commission = Commission = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Commission);
exports.CommissionSchema = mongoose_1.SchemaFactory.createForClass(Commission);
exports.CommissionSchema.index({ technician: 1, status: 1 });
exports.CommissionSchema.index({ booking: 1 });
//# sourceMappingURL=commission.schema.js.map
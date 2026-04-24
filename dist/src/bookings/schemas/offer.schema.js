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
exports.OfferSchema = exports.Offer = exports.OfferStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["PENDING"] = "pending";
    OfferStatus["ACCEPTED"] = "accepted";
    OfferStatus["REJECTED"] = "rejected";
    OfferStatus["EXPIRED"] = "expired";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
let Offer = class Offer {
};
exports.Offer = Offer;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Booking', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Offer.prototype, "booking", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Technician', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Offer.prototype, "technician", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Offer.prototype, "technicianUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Offer.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Offer.prototype, "note", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: OfferStatus, default: OfferStatus.PENDING }),
    __metadata("design:type", String)
], Offer.prototype, "status", void 0);
exports.Offer = Offer = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Offer);
exports.OfferSchema = mongoose_1.SchemaFactory.createForClass(Offer);
exports.OfferSchema.index({ booking: 1, technician: 1 }, { unique: true });
exports.OfferSchema.index({ booking: 1, status: 1 });
//# sourceMappingURL=offer.schema.js.map
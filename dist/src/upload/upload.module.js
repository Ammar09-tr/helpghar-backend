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
exports.UploadModule = exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const mongoose_3 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp|pdf/;
const MAX_SIZE_MB = 5;
function getUploadStorage(subfolder) {
    const dest = (0, path_1.join)(process.cwd(), 'uploads', subfolder);
    if (!(0, fs_1.existsSync)(dest))
        (0, fs_1.mkdirSync)(dest, { recursive: true });
    return (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => cb(null, dest),
        filename: (_req, file, cb) => {
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            const name = `${(0, uuid_1.v4)()}${ext}`;
            cb(null, name);
        },
    });
}
function fileFilter(_req, file, cb) {
    const ext = (0, path_1.extname)(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (ALLOWED_TYPES.test(ext) || ALLOWED_TYPES.test(mime)) {
        cb(null, true);
    }
    else {
        cb(new common_1.BadRequestException(`File type not allowed. Allowed: jpeg, jpg, png, gif, webp, pdf`), false);
    }
}
let UploadController = class UploadController {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async uploadProfilePicture(req, file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const userId = req.user?.userId || req.user?.sub;
        const fileUrl = `/uploads/profiles/${file.filename}`;
        await this.userModel.findByIdAndUpdate(userId, { profilePicture: fileUrl });
        return { url: fileUrl, message: 'Profile picture updated successfully' };
    }
    uploadBookingImages(files) {
        if (!files || files.length === 0)
            throw new common_1.BadRequestException('No files uploaded');
        const urls = files.map(f => `/uploads/bookings/${f.filename}`);
        return { urls, message: `${files.length} image(s) uploaded successfully` };
    }
    uploadCnicImages(files) {
        if (!files || files.length === 0)
            throw new common_1.BadRequestException('No files uploaded');
        const urls = files.map(f => `/uploads/cnic/${f.filename}`);
        return { urls, message: 'CNIC images uploaded successfully. Admin will verify during approval.' };
    }
    uploadChatImage(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        return { url: `/uploads/chat/${file.filename}`, message: 'Image uploaded' };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('profile-picture'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload profile picture' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: getUploadStorage('profiles'),
        fileFilter: fileFilter,
        limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Post)('booking-images'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload booking problem images (max 5)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, {
        storage: getUploadStorage('bookings'),
        fileFilter: fileFilter,
        limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "uploadBookingImages", null);
__decorate([
    (0, common_1.Post)('cnic-images'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload CNIC front and back images (Technician)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 2, {
        storage: getUploadStorage('cnic'),
        fileFilter: fileFilter,
        limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "uploadCnicImages", null);
__decorate([
    (0, common_1.Post)('chat-image'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a chat image' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: getUploadStorage('chat'),
        fileFilter: fileFilter,
        limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "uploadChatImage", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('Upload'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('upload'),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_3.Model])
], UploadController);
let UploadModule = class UploadModule {
};
exports.UploadModule = UploadModule;
exports.UploadModule = UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_2.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }])],
        controllers: [UploadController],
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map
import {
  Controller, Post, UploadedFile, UploadedFiles,
  UseInterceptors, UseGuards, Request, BadRequestException,
  Get, Param, Res, Module,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserSchema } from '../users/schemas/user.schema';

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp|pdf/;
const MAX_SIZE_MB   = 5;

function getUploadStorage(subfolder: string) {
  const dest = join(process.cwd(), 'uploads', subfolder);
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });

  return diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext  = extname(file.originalname).toLowerCase();
      const name = `${uuidv4()}${ext}`;
      cb(null, name);
    },
  });
}

function fileFilter(_req: any, file: Express.Multer.File, cb: any) {
  const ext  = extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;
  if (ALLOWED_TYPES.test(ext) || ALLOWED_TYPES.test(mime)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`File type not allowed. Allowed: jpeg, jpg, png, gif, webp, pdf`), false);
  }
}

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('upload')
export class UploadController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  @Post('profile-picture')
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', {
    storage:    getUploadStorage('profiles'),
    fileFilter: fileFilter,
    limits:     { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  }))
  async uploadProfilePicture(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const userId  = req.user?.userId || req.user?.sub;
    const fileUrl = `/uploads/profiles/${file.filename}`;
    await this.userModel.findByIdAndUpdate(userId, { profilePicture: fileUrl });
    return { url: fileUrl, message: 'Profile picture updated successfully' };
  }

  @Post('booking-images')
  @ApiOperation({ summary: 'Upload booking problem images (max 5)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage:    getUploadStorage('bookings'),
    fileFilter: fileFilter,
    limits:     { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  }))
  uploadBookingImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files uploaded');
    const urls = files.map(f => `/uploads/bookings/${f.filename}`);
    return { urls, message: `${files.length} image(s) uploaded successfully` };
  }

  @Post('cnic-images')
  @ApiOperation({ summary: 'Upload CNIC front and back images (Technician)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(FilesInterceptor('files', 2, {
    storage:    getUploadStorage('cnic'),
    fileFilter: fileFilter,
    limits:     { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  }))
  uploadCnicImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files uploaded');
    const urls = files.map(f => `/uploads/cnic/${f.filename}`);
    return { urls, message: 'CNIC images uploaded successfully. Admin will verify during approval.' };
  }

  @Post('chat-image')
  @ApiOperation({ summary: 'Upload a chat image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', {
    storage:    getUploadStorage('chat'),
    fileFilter: fileFilter,
    limits:     { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  }))
  uploadChatImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return { url: `/uploads/chat/${file.filename}`, message: 'Image uploaded' };
  }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UploadController],
})
export class UploadModule {}

import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  RegisterCustomerDto, RegisterTechnicianDto,
  LoginDto, RegisterAdminDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/customer')
  @ApiOperation({ summary: 'Register a new customer account' })
  registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('register/technician')
  @ApiOperation({ summary: 'Register a technician (requires CNIC, pending admin approval)' })
  registerTechnician(@Body() dto: RegisterTechnicianDto) {
    return this.authService.registerTechnician(dto);
  }

  @Post('register/admin')
  @ApiOperation({ summary: 'Register admin (requires secret key)' })
  registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login — all roles' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@Request() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?._id;
    return this.authService.getMe(userId);
  }
}

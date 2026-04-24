import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SendMessageDto {
  @ApiProperty() @IsString() @IsNotEmpty() content: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
}

const uid  = (req: any) => req.user?.userId || req.user?.sub || req.user?._id;
const role = (req: any) => req.user?.role;

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post(':bookingId/messages')
  @ApiOperation({ summary: 'Send a message in a booking conversation' })
  sendMessage(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(uid(req), role(req), bookingId, dto);
  }

  @Get(':bookingId/messages')
  @ApiOperation({ summary: 'Get all messages for a booking' })
  getMessages(@Request() req: any, @Param('bookingId') bookingId: string) {
    return this.chatService.getMessages(uid(req), bookingId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@Request() req: any) {
    return this.chatService.getUnreadCount(uid(req));
  }
}

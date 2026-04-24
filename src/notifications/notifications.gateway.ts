import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: false },
  transports: ['polling', 'websocket'],
  namespace: '/realtime',
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;
  private logger         = new Logger('NotificationsGateway');
  private connectedUsers = new Map<string, Set<string>>();
  private socketUserMap  = new Map<string, string>();
  private socketRoleMap  = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('🔌 WebSocket gateway initialised (polling + websocket)');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) { client.disconnect(); return; }

      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET', 'helpghar_secret'),
      });
      const userId = payload.sub;
      const role   = payload.role;

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);
      this.socketUserMap.set(client.id, userId);
      this.socketRoleMap.set(client.id, role);

      client.join(`user:${userId}`);
      client.join(`role:${role}`);

      client.emit('connected', { message: 'Connected to HelpGhar', userId, role });
      this.logger.log(`✅ Connected: ${userId} [${role}] socket: ${client.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.connectedUsers.get(userId)?.delete(client.id);
      if (this.connectedUsers.get(userId)?.size === 0) {
        this.connectedUsers.delete(userId);
      }
      this.socketUserMap.delete(client.id);
      this.socketRoleMap.delete(client.id);
    }
    this.logger.log(`🔴 Disconnected: ${client.id}`);
  }

  notifyUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  broadcastChatMessage(bookingId: string, message: any) {
    this.server.to(`booking:${bookingId}`).emit('chat:message', message);
  }

  notifyNearbyTechnicians(serviceType: string, booking: any) {
    this.server.to('role:technician').emit('booking:new_request', {
      bookingId:          booking._id,
      serviceType,
      customerLocation:   booking.customerLocation,
      problemDescription: booking.problemDescription,
      customer:           booking.customer,
      createdAt:          booking.createdAt,
    });
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  @SubscribeMessage('booking:join')
  handleJoinBooking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    client.join(`booking:${data.bookingId}`);
    client.emit('booking:joined', { bookingId: data.bookingId });
  }

  @SubscribeMessage('booking:leave')
  handleLeaveBooking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    client.leave(`booking:${data.bookingId}`);
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string; isTyping: boolean },
  ) {
    const userId = this.socketUserMap.get(client.id);
    client.to(`booking:${data.bookingId}`).emit('chat:typing', {
      userId, isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('location:update')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string; latitude: number; longitude: number },
  ) {
    this.server.to(`booking:${data.bookingId}`).emit('location:technician', {
      latitude:  data.latitude,
      longitude: data.longitude,
      updatedAt: new Date(),
    });
  }
}

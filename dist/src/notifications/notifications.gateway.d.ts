import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private config;
    server: Server;
    private logger;
    private connectedUsers;
    private socketUserMap;
    private socketRoleMap;
    constructor(jwtService: JwtService, config: ConfigService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    notifyUser(userId: string, event: string, data: any): void;
    broadcastChatMessage(bookingId: string, message: any): void;
    notifyNearbyTechnicians(serviceType: string, booking: any): void;
    broadcastToAll(event: string, data: any): void;
    handleJoinBooking(client: Socket, data: {
        bookingId: string;
    }): void;
    handleLeaveBooking(client: Socket, data: {
        bookingId: string;
    }): void;
    handleTyping(client: Socket, data: {
        bookingId: string;
        isTyping: boolean;
    }): void;
    handleLocationUpdate(client: Socket, data: {
        bookingId: string;
        latitude: number;
        longitude: number;
    }): void;
}

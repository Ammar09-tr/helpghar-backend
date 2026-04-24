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
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let NotificationsGateway = class NotificationsGateway {
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
        this.logger = new common_1.Logger('NotificationsGateway');
        this.connectedUsers = new Map();
        this.socketUserMap = new Map();
        this.socketRoleMap = new Map();
    }
    afterInit() {
        this.logger.log('🔌 WebSocket gateway initialised (polling + websocket)');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: this.config.get('JWT_SECRET', 'helpghar_secret'),
            });
            const userId = payload.sub;
            const role = payload.role;
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId).add(client.id);
            this.socketUserMap.set(client.id, userId);
            this.socketRoleMap.set(client.id, role);
            client.join(`user:${userId}`);
            client.join(`role:${role}`);
            client.emit('connected', { message: 'Connected to HelpGhar', userId, role });
            this.logger.log(`✅ Connected: ${userId} [${role}] socket: ${client.id}`);
        }
        catch {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
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
    notifyUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    broadcastChatMessage(bookingId, message) {
        this.server.to(`booking:${bookingId}`).emit('chat:message', message);
    }
    notifyNearbyTechnicians(serviceType, booking) {
        this.server.to('role:technician').emit('booking:new_request', {
            bookingId: booking._id,
            serviceType,
            customerLocation: booking.customerLocation,
            problemDescription: booking.problemDescription,
            customer: booking.customer,
            createdAt: booking.createdAt,
        });
    }
    broadcastToAll(event, data) {
        this.server.emit(event, data);
    }
    handleJoinBooking(client, data) {
        client.join(`booking:${data.bookingId}`);
        client.emit('booking:joined', { bookingId: data.bookingId });
    }
    handleLeaveBooking(client, data) {
        client.leave(`booking:${data.bookingId}`);
    }
    handleTyping(client, data) {
        const userId = this.socketUserMap.get(client.id);
        client.to(`booking:${data.bookingId}`).emit('chat:typing', {
            userId, isTyping: data.isTyping,
        });
    }
    handleLocationUpdate(client, data) {
        this.server.to(`booking:${data.bookingId}`).emit('location:technician', {
            latitude: data.latitude,
            longitude: data.longitude,
            updatedAt: new Date(),
        });
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('booking:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleJoinBooking", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('booking:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleLeaveBooking", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('location:update'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleLocationUpdate", null);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*', methods: ['GET', 'POST'], credentials: false },
        transports: ['polling', 'websocket'],
        namespace: '/realtime',
        pingTimeout: 60000,
        pingInterval: 25000,
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map
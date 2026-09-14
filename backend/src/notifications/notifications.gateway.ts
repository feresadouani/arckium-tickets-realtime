import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface RealtimeNotification {
  type: 'critical' | 'assignment' | 'update' | 'resolved' | 'comment';
  title: string;
  message: string;
  timestamp: string;
  targetUserId?: string;
  targetRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId?: string; role?: string },
  ) {
    if (data?.userId) {
      void client.join(`user:${data.userId}`);
    }
    if (data?.role) {
      void client.join(`role:${data.role}`);
    }
    void client.join('all');
    return { ok: true };
  }

  emitNotification(notification: RealtimeNotification) {
    const payload = {
      ...notification,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
    };

    if (notification.targetUserId) {
      this.server
        .to(`user:${notification.targetUserId}`)
        .emit('notification', payload);
    } else if (notification.targetRole) {
      this.server
        .to(`role:${notification.targetRole}`)
        .emit('notification', payload);
    } else {
      this.server.to('all').emit('notification', payload);
    }
  }
}

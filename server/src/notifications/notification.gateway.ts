import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { 
    origin: 'http://localhost:3000',
    credentials: true 
  },
  namespace: '/',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      await client.join(`user_${userId}`);
      console.log(`🟢 User ${userId} joined room user_${userId}`);
    } else {
        console.log('🔴 Connection rejected: No userId');
        client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      console.log(`🔴 User ${userId} disconnected from room user_${userId}`);
    }
  }

  sendToUser(userId: string, payload: any) {
    // Emit to the ROOM, not a specific socket ID
    console.log(`🚀 Sending notification to room: user_${userId}`);
    this.server.to(`user_${userId}`).emit('notification', payload);
  }
}

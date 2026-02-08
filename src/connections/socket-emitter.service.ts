import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export const USER_ROOM_PREFIX = 'user:';

@Injectable()
export class SocketEmitterService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    if (!this.server) return;
    const room = `${USER_ROOM_PREFIX}${userId}`;
    this.server.to(room).emit(event, data);
  }
}

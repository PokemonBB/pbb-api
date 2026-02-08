import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SocketEmitterService, USER_ROOM_PREFIX } from './socket-emitter.service';
import { getTokenFromHandshake } from './helpers/handshake-auth.helper';

@WebSocketGateway({
  cors: { origin: true },
})
export class ConnectionsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketEmitter: SocketEmitterService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.socketEmitter.setServer(server);
  }

  handleConnection(client: Socket) {
    const cookieHeader = client.handshake.headers.cookie;
    const token = getTokenFromHandshake(cookieHeader);
    if (!token) return;
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      const userId = payload.sub;
      if (userId) client.join(`${USER_ROOM_PREFIX}${userId}`);
    } catch {
      return;
    }
  }

  handleDisconnect(client: Socket) {}
}

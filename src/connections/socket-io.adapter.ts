import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { ServerOptions } from 'socket.io';

export interface SocketIoAdapterOptions {
  corsOrigins: string[];
  credentials: boolean;
}

export class SocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly adapterOptions: SocketIoAdapterOptions,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const origins = this.adapterOptions.corsOrigins;
    const cors = {
      origin: origins,
      credentials: this.adapterOptions.credentials,
    };
    return super.createIOServer(port, { ...options, cors }) as Server;
  }
}

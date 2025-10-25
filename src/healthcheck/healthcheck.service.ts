import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Injectable()
export class HealthcheckService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getApiStatus() {
    const timestamp = new Date().toISOString();

    return {
      status: 'ok',
      timestamp,
    };
  }

  getDbStatus() {
    const timestamp = new Date().toISOString();

    try {
      const dbStatus = this.checkDatabase();

      return {
        status: dbStatus.connected ? 'ok' : 'error',
        timestamp,
      };
    } catch {
      return {
        status: 'error',
        timestamp,
      };
    }
  }

  private checkDatabase() {
    try {
      const state = this.connection.readyState;
      return {
        connected: state === ConnectionStates.connected,
      };
    } catch {
      return {
        connected: false,
      };
    }
  }
}

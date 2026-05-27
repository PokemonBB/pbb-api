import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const SYSTEM_PREFIX = 'system.';

@Injectable()
export class ExportService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getCollectionNames(): Promise<string[]> {
    const db = this.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const all = await db.listCollections().toArray();
    return all
      .map((c) => c.name)
      .filter((name) => !name.startsWith(SYSTEM_PREFIX))
      .sort();
  }

  async getExportData(
    collections: string[],
  ): Promise<Record<string, unknown[]>> {
    const db = this.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    let names: string[];
    if (!collections || collections.length === 0) {
      const all = await db.listCollections().toArray();
      names = all
        .map((c) => c.name)
        .filter((name) => !name.startsWith(SYSTEM_PREFIX));
    } else {
      const existing = await db.listCollections().toArray();
      const existingSet = new Set(existing.map((c) => c.name));
      names = collections.filter((name) => existingSet.has(name));
    }

    const result: Record<string, unknown[]> = {};

    for (const name of names) {
      const col = db.collection(name);
      const docs = await col.find({}).toArray();
      result[name] = docs.map((doc) => this.serializeDocument(doc));
    }

    return result;
  }

  private serializeDocument(doc: Record<string, unknown>): unknown {
    return JSON.parse(JSON.stringify(doc));
  }
}

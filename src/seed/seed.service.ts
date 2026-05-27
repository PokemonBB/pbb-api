import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const BCRYPT_PATTERN = /^\$2[aby]?\$\d{1,2}\$.{53}$/;
const PASSWORD_FIELDS = new Set(['password']);
const SEED_ORDER = ['types', 'pokemons', 'moves'];

interface SeedFile {
  filePath: string;
  collection: string;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async seedDatabase(): Promise<void> {
    this.logger.log('💾🔵 Starting database seed...');

    const seedFiles = this.getSeedFiles();

    for (const seedFile of seedFiles) {
      await this.seedCollection(seedFile);
    }

    this.logger.log('💾🟢 Database seed completed');
  }

  async resetAndSeed(
    collectionNames?: string[],
  ): Promise<{ dropped: string[]; seeded: string[] }> {
    const db = this.connection.db!;
    const allCollections = await db.listCollections().toArray();
    const allNames = allCollections.map((c) => c.name);
    const hasFilter = (collectionNames?.length ?? 0) > 0;
    const targetNames = hasFilter
      ? collectionNames!.filter((name) => allNames.includes(name))
      : allNames;

    if (targetNames.length === 0 && hasFilter) {
      this.logger.warn('💾⚠️ No matching collections to reset');
      return { dropped: [], seeded: [] };
    }

    this.logger.log(
      targetNames.length === allNames.length
        ? '💾🔴 Starting full database reset...'
        : `💾🔴 Resetting collections: ${targetNames.join(', ')}`,
    );

    const dropped: string[] = [];
    for (const name of targetNames) {
      await db.dropCollection(name);
      dropped.push(name);
      this.logger.log(`💾🗑️ Dropped collection: ${name}`);
    }

    this.logger.log('💾🔵 Re-seeding...');

    const seedFiles = this.getSeedFiles();
    const toSeed = hasFilter
      ? seedFiles.filter((s) => collectionNames!.includes(s.collection))
      : seedFiles;
    const seeded: string[] = [];

    for (const seedFile of toSeed) {
      await this.seedCollection(seedFile);
      seeded.push(seedFile.collection);
    }

    this.logger.log('💾🟢 Reset and seed completed');
    return { dropped, seeded };
  }

  private getSeedDirs(): string[] {
    const dirs = [
      path.join(process.cwd(), 'seed-common'),
      path.join(process.cwd(), 'seed'),
    ];
    return dirs.filter((d) => fs.existsSync(d));
  }

  private getSeedFiles(): SeedFile[] {
    const seedDirs = this.getSeedDirs();

    if (seedDirs.length === 0) {
      this.logger.warn('💾🔴 No seed directories found');
      return [];
    }

    const seen = new Set<string>();
    const seedFiles: SeedFile[] = [];

    for (const dir of seedDirs) {
      const files = fs
        .readdirSync(dir)
        .filter((file) => file.endsWith('.json'));

      for (const file of files) {
        const collection = file.replace('.json', '');

        if (seen.has(collection)) {
          this.logger.log(
            `💾⚠️ Collection ${collection} already found in a previous seed directory, skipping duplicate`,
          );
          continue;
        }
        seen.add(collection);

        seedFiles.push({ filePath: path.join(dir, file), collection });
      }
    }

    seedFiles.sort((a, b) => {
      const ai = SEED_ORDER.indexOf(a.collection);
      const bi = SEED_ORDER.indexOf(b.collection);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.collection.localeCompare(b.collection);
    });
    return seedFiles;
  }

  private async seedCollection(seedFile: SeedFile): Promise<void> {
    try {
      const col = this.connection.db!.collection(seedFile.collection);
      const count = await col.countDocuments();

      if (count > 0) {
        this.logger.log(
          `💾🔴 Collection ${seedFile.collection} is not empty, skipping seed`,
        );
        return;
      }

      const raw = fs.readFileSync(seedFile.filePath, 'utf8');
      const data: unknown = JSON.parse(raw);

      if (!Array.isArray(data) || data.length === 0) {
        this.logger.warn(
          `Seed file ${seedFile.filePath} does not contain a non-empty array`,
        );
        return;
      }

      let docsToTransform = data as Record<string, unknown>[];
      if (seedFile.collection === 'pokemons') {
        const typeIdToObjectId = await this.getTypeIdToObjectIdMap();
        docsToTransform = docsToTransform.map((doc) =>
          this.resolvePokemonTypes(doc, typeIdToObjectId),
        );
      }
      if (seedFile.collection === 'moves') {
        const typeIdToObjectId = await this.getTypeIdToObjectIdMap();
        const pokemonIdToObjectId = await this.getPokemonIdToObjectIdMap();
        docsToTransform = docsToTransform.map((doc) =>
          this.resolveMoveDoc(doc, typeIdToObjectId, pokemonIdToObjectId),
        );
      }

      const transformed: Record<string, unknown>[] = [];
      for (const doc of docsToTransform) {
        transformed.push(await this.transformDocument(doc));
      }

      await col.insertMany(transformed);

      this.logger.log(
        `💾🟢 Seeded ${seedFile.collection} with ${transformed.length} records`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to seed ${seedFile.collection}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async getTypeIdToObjectIdMap(): Promise<Map<number, ObjectId>> {
    const typesCol = this.connection.db!.collection('types');
    const typeDocs = await typesCol.find({}).toArray();
    const map = new Map<number, ObjectId>();
    for (const t of typeDocs) {
      if (typeof t.id === 'number') {
        map.set(t.id, t._id);
      }
    }
    return map;
  }

  private async getPokemonIdToObjectIdMap(): Promise<Map<number, ObjectId>> {
    const pokemonsCol = this.connection.db!.collection('pokemons');
    const pokemonDocs = await pokemonsCol.find({}).toArray();
    const map = new Map<number, ObjectId>();
    for (const p of pokemonDocs) {
      if (typeof p.id === 'number') {
        map.set(p.id, p._id);
      }
    }
    return map;
  }

  private resolvePokemonTypes(
    doc: Record<string, unknown>,
    typeIdToObjectId: Map<number, ObjectId>,
  ): Record<string, unknown> {
    const types = doc.types;
    if (!Array.isArray(types)) return doc;

    const resolved = types
      .map((el: { slot?: number; type?: { id?: number } }) => {
        const typeId = el?.type?.id;
        if (typeId == null) return null;
        const objectId = typeIdToObjectId.get(typeId);
        if (!objectId) {
          this.logger.warn(
            `Pokemon type id ${typeId} not found in types collection, skipping`,
          );
          return null;
        }
        return { slot: el.slot, type: objectId };
      })
      .filter((el): el is { slot: number; type: ObjectId } => el != null);

    return { ...doc, types: resolved };
  }

  private resolveMoveDoc(
    doc: Record<string, unknown>,
    typeIdToObjectId: Map<number, ObjectId>,
    pokemonIdToObjectId: Map<number, ObjectId>,
  ): Record<string, unknown> {
    const typeObj = doc.type as { id?: number; name?: string } | undefined;
    const typeId = typeObj?.id;
    let result = { ...doc };
    if (typeId != null) {
      const typeObjectId = typeIdToObjectId.get(typeId);
      if (!typeObjectId) {
        this.logger.warn(
          `Move type id ${typeId} not found in types collection, skipping move`,
        );
      } else {
        result = { ...result, type: typeObjectId };
      }
    }
    const learnedBy = doc.learned_by_pokemon;
    if (Array.isArray(learnedBy)) {
      const resolved: ObjectId[] = [];
      for (const entry of learnedBy as { id?: number; name?: string }[]) {
        const pokemonId = entry?.id;
        if (pokemonId == null) continue;
        const objectId = pokemonIdToObjectId.get(pokemonId);
        if (objectId) {
          resolved.push(objectId);
        }
      }
      result = { ...result, learned_by_pokemon: resolved };
    }
    return result;
  }

  private async transformDocument(
    doc: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(doc)) {
      result[key] = await this.transformValue(key, value);
    }

    return result;
  }

  private async transformValue(key: string, value: unknown): Promise<unknown> {
    if (value === null || value === undefined) {
      return value;
    }

    if (value instanceof ObjectId) {
      return value;
    }

    if (typeof value === 'string') {
      if (PASSWORD_FIELDS.has(key) && !BCRYPT_PATTERN.test(value)) {
        return bcrypt.hash(value, 10);
      }

      if (OBJECT_ID_PATTERN.test(value)) {
        return new ObjectId(value);
      }

      if (ISO_DATE_PATTERN.test(value)) {
        return new Date(value);
      }

      return value;
    }

    if (Array.isArray(value)) {
      const transformed: unknown[] = [];
      for (const item of value) {
        if (item instanceof ObjectId) {
          transformed.push(item);
        } else if (
          typeof item === 'object' &&
          item !== null &&
          !Array.isArray(item)
        ) {
          transformed.push(
            await this.transformDocument(item as Record<string, unknown>),
          );
        } else {
          transformed.push(await this.transformValue(key, item));
        }
      }
      return transformed;
    }

    if (typeof value === 'object') {
      return this.transformDocument(value as Record<string, unknown>);
    }

    return value;
  }
}

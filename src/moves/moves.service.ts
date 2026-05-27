import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Move, MoveDocument } from '../schemas/move.schema';
import {
  PokemonType,
  PokemonTypeDocument,
} from '../schemas/pokemon-type.schema';
import { Pokemon, PokemonDocument } from '../schemas/pokemon.schema';
import { UpdateMoveDto } from './dto/update-move.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/helpers/pagination.helper';

@Injectable()
export class MovesService {
  constructor(
    @InjectModel(Move.name)
    private moveModel: Model<MoveDocument>,
    @InjectModel(PokemonType.name)
    private pokemonTypeModel: Model<PokemonTypeDocument>,
    @InjectModel(Pokemon.name)
    private pokemonModel: Model<PokemonDocument>,
  ) {}

  async findAllPaginated(
    paginationDto: PaginationDto,
    populatePaths: string[] = [],
    typeIds?: number[],
  ): Promise<PaginatedResponse<MoveDocument>> {
    const { page, limit, skip } = getPaginationParams(paginationDto);
    const filter = await this.buildTypeFilter(typeIds);
    const allowedPopulate = new Set(['type', 'learned_by_pokemon']);
    const toPopulate = populatePaths.filter((p) => allowedPopulate.has(p));
    let query: ReturnType<Model<MoveDocument>['find']> = this.moveModel
      .find(filter)
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit);
    if (toPopulate.includes('type')) {
      query = query.populate('type');
    }
    if (toPopulate.includes('learned_by_pokemon')) {
      query = query.populate('learned_by_pokemon');
    }
    const [data, total] = await Promise.all([
      query.exec(),
      this.moveModel.countDocuments(filter),
    ]);
    return createPaginatedResponse(data as MoveDocument[], total, page, limit);
  }

  private async buildTypeFilter(
    typeIds?: number[],
  ): Promise<Record<string, unknown>> {
    if (!typeIds?.length) return {};
    const typeIdToObjectId = await this.getTypeIdToObjectIdMap();
    const objectIds = typeIds
      .map((id) => typeIdToObjectId.get(id))
      .filter((id): id is ObjectId => id != null);
    if (objectIds.length === 0) return { id: -1 };
    return { type: { $in: objectIds } };
  }

  private async getTypeIdToObjectIdMap(): Promise<Map<number, ObjectId>> {
    const typeDocs = await this.pokemonTypeModel.find().lean().exec();
    const map = new Map<number, ObjectId>();
    for (const t of typeDocs) {
      if (typeof t.id === 'number') {
        map.set(t.id, t._id as ObjectId);
      }
    }
    return map;
  }

  async findById(id: number): Promise<MoveDocument> {
    const move = await this.moveModel
      .findOne({ id })
      .populate('type')
      .populate('learned_by_pokemon')
      .exec();
    if (!move) {
      throw new NotFoundException(`Move with id ${id} not found`);
    }
    return move;
  }

  async update(id: number, dto: UpdateMoveDto): Promise<MoveDocument> {
    const move = await this.moveModel.findOne({ id }).exec();
    if (!move) {
      throw new NotFoundException(`Move with id ${id} not found`);
    }
    const update: Record<string, unknown> = {};
    if (dto.accuracy !== undefined) {
      update.accuracy = dto.accuracy;
    }
    if (dto.power !== undefined) {
      update.power = dto.power;
    }
    if (dto.pp !== undefined) {
      update.pp = dto.pp;
    }
    if (dto.priority !== undefined) {
      update.priority = dto.priority;
    }
    if (dto.typeId !== undefined) {
      const typeObjectId = await this.getTypeObjectId(dto.typeId);
      if (!typeObjectId) {
        throw new NotFoundException(`Type with id ${dto.typeId} not found`);
      }
      update.type = typeObjectId;
    }
    if (dto.learned_by_pokemon !== undefined) {
      const objectIds = await this.getPokemonObjectIds(dto.learned_by_pokemon);
      update.learned_by_pokemon = objectIds;
    }
    if (Object.keys(update).length === 0) {
      return this.findById(id);
    }
    await this.moveModel.updateOne({ id }, { $set: update }).exec();
    return this.findById(id);
  }

  private async getTypeObjectId(typeId: number): Promise<ObjectId | null> {
    const map = await this.getTypeIdToObjectIdMap();
    return map.get(typeId) ?? null;
  }

  private async getPokemonObjectIds(pokemonIds: number[]): Promise<ObjectId[]> {
    const docs = await this.pokemonModel
      .find({ id: { $in: pokemonIds } })
      .lean()
      .exec();
    const byId = new Map<number, ObjectId>();
    for (const d of docs) {
      if (typeof d.id === 'number') {
        byId.set(d.id, d._id as ObjectId);
      }
    }
    return pokemonIds
      .map((pid) => byId.get(pid))
      .filter((oid): oid is ObjectId => oid != null);
  }
}

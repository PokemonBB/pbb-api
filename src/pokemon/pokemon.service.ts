import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Pokemon, PokemonDocument } from '../schemas/pokemon.schema';
import {
  PokemonType,
  PokemonTypeDocument,
} from '../schemas/pokemon-type.schema';
import { Move, MoveDocument } from '../schemas/move.schema';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/helpers/pagination.helper';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private pokemonModel: Model<PokemonDocument>,
    @InjectModel(PokemonType.name)
    private pokemonTypeModel: Model<PokemonTypeDocument>,
    @InjectModel(Move.name)
    private moveModel: Model<MoveDocument>,
  ) {}

  async findAllPaginated(
    paginationDto: PaginationDto,
    typeIds?: number[],
  ): Promise<PaginatedResponse<PokemonDocument>> {
    const { page, limit, skip } = getPaginationParams(paginationDto);
    const filter = await this.buildTypeFilter(typeIds);
    const [data, total] = await Promise.all([
      this.pokemonModel
        .find(filter)
        .sort({ id: 1 })
        .skip(skip)
        .limit(limit)
        .populate('types.type')
        .exec(),
      this.pokemonModel.countDocuments(filter),
    ]);
    return createPaginatedResponse(data, total, page, limit);
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
    return { 'types.type': { $in: objectIds } };
  }

  async searchPaginated(
    query: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<PokemonDocument>> {
    const filter = this.buildSearchFilter(query);
    const { page, limit, skip } = getPaginationParams(paginationDto);
    const [data, total] = await Promise.all([
      this.pokemonModel
        .find(filter)
        .sort({ id: 1 })
        .skip(skip)
        .limit(limit)
        .populate('types.type')
        .exec(),
      this.pokemonModel.countDocuments(filter),
    ]);
    return createPaginatedResponse(data, total, page, limit);
  }

  private buildSearchFilter(query: string): Record<string, unknown> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { id: -1 };
    }
    const numericId = /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : NaN;
    if (!Number.isNaN(numericId)) {
      return { id: numericId };
    }
    return { name: new RegExp(trimmed, 'i') };
  }

  async findById(id: number): Promise<PokemonDocument> {
    const pokemon = await this.pokemonModel
      .findOne({ id })
      .populate('types.type')
      .exec();

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }

    return pokemon;
  }

  async getMovesForPokemon(
    pokemonId: number,
    populateType = false,
  ): Promise<MoveDocument[]> {
    const pokemon = await this.pokemonModel
      .findOne({ id: pokemonId })
      .lean()
      .exec();
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${pokemonId} not found`);
    }
    const pokemonObjectId = pokemon._id as ObjectId;
    const query = this.moveModel
      .find({ learned_by_pokemon: pokemonObjectId })
      .sort({ id: 1 });
    const result = populateType
      ? await query.populate('type').exec()
      : await query.exec();
    return result as MoveDocument[];
  }

  async update(id: number, dto: UpdatePokemonDto): Promise<PokemonDocument> {
    const pokemon = await this.pokemonModel.findOne({ id }).exec();
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }

    const update: Record<string, unknown> = {};
    if (dto.types != null) {
      const typeIdToObjectId = await this.getTypeIdToObjectIdMap();
      update.types = dto.types
        .map(({ slot, typeId }) => {
          const objectId = typeIdToObjectId.get(typeId);
          if (!objectId) return null;
          return { slot, type: objectId };
        })
        .filter((t): t is { slot: number; type: ObjectId } => t != null);
    }
    if (dto.stats != null) {
      update.stats = dto.stats.map(({ name, base_stat }) => ({
        name,
        base_stat,
      }));
    }

    if (Object.keys(update).length === 0) {
      return this.pokemonModel
        .findOne({ id })
        .populate('types.type')
        .exec() as Promise<PokemonDocument>;
    }

    await this.pokemonModel.updateOne({ id }, { $set: update }).exec();
    return this.findById(id);
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
}

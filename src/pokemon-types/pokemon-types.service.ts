import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PokemonType,
  PokemonTypeDocument,
} from '../schemas/pokemon-type.schema';
import { UpdateDamageRelationDto } from './dto/update-damage-relation.dto';

interface TypeRef {
  id: number;
  name: string;
}

interface RelationFields {
  toField: string;
  fromField: string;
}

const MULTIPLIER_MAP = new Map<string, RelationFields | null>([
  ['x2', { toField: 'double_damage_to', fromField: 'double_damage_from' }],
  ['x0.5', { toField: 'half_damage_to', fromField: 'half_damage_from' }],
  ['x0', { toField: 'no_damage_to', fromField: 'no_damage_from' }],
  ['x1', null],
]);

@Injectable()
export class PokemonTypesService {
  constructor(
    @InjectModel(PokemonType.name)
    private pokemonTypeModel: Model<PokemonTypeDocument>,
  ) {}

  async findAll(): Promise<PokemonType[]> {
    return this.pokemonTypeModel.find().exec();
  }

  async findById(id: number): Promise<PokemonType> {
    const type = await this.pokemonTypeModel.findOne({ id }).exec();

    if (!type) {
      throw new NotFoundException(`Type with id ${id} not found`);
    }

    return type;
  }

  async updateDamageRelation(
    dto: UpdateDamageRelationDto,
  ): Promise<{ attacker: PokemonType; defender: PokemonType }> {
    const [attackerDoc, defenderDoc] = await Promise.all([
      this.pokemonTypeModel.findOne({ id: dto.attackerId }).lean().exec(),
      this.pokemonTypeModel.findOne({ id: dto.defenderId }).lean().exec(),
    ]);

    if (!attackerDoc) {
      throw new NotFoundException(`Type with id ${dto.attackerId} not found`);
    }
    if (!defenderDoc) {
      throw new NotFoundException(`Type with id ${dto.defenderId} not found`);
    }

    const attacker = attackerDoc as unknown as PokemonType;
    const defender = defenderDoc as unknown as PokemonType;

    const attackerRef: TypeRef = { id: attacker.id, name: attacker.name };
    const defenderRef: TypeRef = { id: defender.id, name: defender.name };
    const mapping = MULTIPLIER_MAP.get(dto.multiplier) ?? null;

    if (dto.attackerId === dto.defenderId) {
      await this.applySelfRelation(dto.attackerId, attackerRef, mapping);
    } else {
      await this.applyCrossRelation(
        dto.attackerId,
        dto.defenderId,
        attackerRef,
        defenderRef,
        mapping,
      );
    }

    const [updatedAttacker, updatedDefender] = await Promise.all([
      this.pokemonTypeModel.findOne({ id: dto.attackerId }).exec(),
      this.pokemonTypeModel.findOne({ id: dto.defenderId }).exec(),
    ]);

    return {
      attacker: updatedAttacker!,
      defender: updatedDefender!,
    };
  }

  private async applySelfRelation(
    typeId: number,
    ref: TypeRef,
    mapping: RelationFields | null,
  ): Promise<void> {
    await this.pokemonTypeModel.updateOne(
      { id: typeId },
      {
        $pull: {
          'damage_relations.double_damage_to': { id: typeId },
          'damage_relations.half_damage_to': { id: typeId },
          'damage_relations.no_damage_to': { id: typeId },
          'damage_relations.double_damage_from': { id: typeId },
          'damage_relations.half_damage_from': { id: typeId },
          'damage_relations.no_damage_from': { id: typeId },
        },
      },
    );

    if (mapping) {
      await this.pokemonTypeModel.updateOne(
        { id: typeId },
        {
          $push: {
            [`damage_relations.${mapping.toField}`]: ref,
            [`damage_relations.${mapping.fromField}`]: ref,
          },
        },
      );
    }
  }

  private async applyCrossRelation(
    attackerId: number,
    defenderId: number,
    attackerRef: TypeRef,
    defenderRef: TypeRef,
    mapping: RelationFields | null,
  ): Promise<void> {
    await Promise.all([
      this.pokemonTypeModel.updateOne(
        { id: attackerId },
        {
          $pull: {
            'damage_relations.double_damage_to': { id: defenderId },
            'damage_relations.half_damage_to': { id: defenderId },
            'damage_relations.no_damage_to': { id: defenderId },
          },
        },
      ),
      this.pokemonTypeModel.updateOne(
        { id: defenderId },
        {
          $pull: {
            'damage_relations.double_damage_from': { id: attackerId },
            'damage_relations.half_damage_from': { id: attackerId },
            'damage_relations.no_damage_from': { id: attackerId },
          },
        },
      ),
    ]);

    if (mapping) {
      await Promise.all([
        this.pokemonTypeModel.updateOne(
          { id: attackerId },
          {
            $push: {
              [`damage_relations.${mapping.toField}`]: defenderRef,
            },
          },
        ),
        this.pokemonTypeModel.updateOne(
          { id: defenderId },
          {
            $push: {
              [`damage_relations.${mapping.fromField}`]: attackerRef,
            },
          },
        ),
      ]);
    }
  }
}

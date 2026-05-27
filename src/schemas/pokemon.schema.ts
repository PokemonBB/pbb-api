import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PokemonDocument = Pokemon & Document;

@Schema({ _id: false })
export class PokemonTypeSlot {
  @Prop({ required: true })
  slot: number;

  @Prop({ type: Types.ObjectId, ref: 'PokemonType', required: true })
  type: Types.ObjectId;
}

@Schema({ _id: false })
export class PokemonStat {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  base_stat: number;
}

@Schema({ timestamps: true, collection: 'pokemons' })
export class Pokemon {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [PokemonTypeSlot], default: [] })
  types: PokemonTypeSlot[];

  @Prop({ required: true })
  base_experience: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  weight: number;

  @Prop({ type: [PokemonStat], default: [] })
  stats: PokemonStat[];
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

PokemonSchema.index({ name: 1 });
PokemonSchema.index({ 'types.type': 1 });

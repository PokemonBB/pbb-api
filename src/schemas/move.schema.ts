import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type MoveDocument = Move & Document;

@Schema({ _id: false })
export class IdNameRef {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;
}

@Schema({ _id: false })
export class MoveMeta {
  @Prop({ required: true })
  ailment: string;

  @Prop({ required: true })
  ailment_chance: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  crit_rate: number;

  @Prop({ required: true })
  drain: number;

  @Prop({ required: true })
  flinch_chance: number;

  @Prop({ required: true })
  healing: number;

  @Prop({ type: Number, default: null })
  max_hits: number | null;

  @Prop({ type: Number, default: null })
  max_turns: number | null;

  @Prop({ type: Number, default: null })
  min_hits: number | null;

  @Prop({ type: Number, default: null })
  min_turns: number | null;

  @Prop({ required: true })
  stat_chance: number;
}

@Schema({ _id: false })
export class FlavorTextEntries {
  @Prop({ default: '' })
  en: string;

  @Prop({ default: '' })
  es: string;
}

@Schema({ timestamps: true, collection: 'moves' })
export class Move {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.Map, of: String, default: {} })
  names: Map<string, string>;

  @Prop({ type: Number, default: null })
  accuracy: number | null;

  @Prop({ required: true })
  power: number;

  @Prop({ required: true })
  pp: number;

  @Prop({ required: true })
  priority: number;

  @Prop({ type: IdNameRef, required: true })
  damage_class: IdNameRef;

  @Prop({ type: Types.ObjectId, ref: 'PokemonType', required: true })
  type: Types.ObjectId;

  @Prop({ type: IdNameRef, required: true })
  target: IdNameRef;

  @Prop({ type: MoveMeta, required: true })
  meta: MoveMeta;

  @Prop({ type: FlavorTextEntries, default: {} })
  flavor_text_entries: FlavorTextEntries;

  @Prop({ type: [Types.ObjectId], ref: 'Pokemon', default: [] })
  learned_by_pokemon: Types.ObjectId[];
}

export const MoveSchema = SchemaFactory.createForClass(Move);

MoveSchema.index({ name: 1 });
MoveSchema.index({ type: 1 });
MoveSchema.index({ learned_by_pokemon: 1 });

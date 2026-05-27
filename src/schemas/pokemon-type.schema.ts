import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PokemonTypeDocument = PokemonType & Document;

@Schema({ _id: false })
export class TypeReference {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;
}

@Schema({ _id: false })
export class DamageRelations {
  @Prop({ type: [TypeReference], default: [] })
  double_damage_from: TypeReference[];

  @Prop({ type: [TypeReference], default: [] })
  double_damage_to: TypeReference[];

  @Prop({ type: [TypeReference], default: [] })
  half_damage_from: TypeReference[];

  @Prop({ type: [TypeReference], default: [] })
  half_damage_to: TypeReference[];

  @Prop({ type: [TypeReference], default: [] })
  no_damage_from: TypeReference[];

  @Prop({ type: [TypeReference], default: [] })
  no_damage_to: TypeReference[];
}

@Schema({ _id: false })
export class MoveDamageClass {
  @Prop({ required: true })
  name: string;
}

@Schema({ collection: 'types' })
export class PokemonType {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  color: string;

  @Prop({ type: MongooseSchema.Types.Map, of: String, default: {} })
  names: Map<string, string>;

  @Prop({ type: DamageRelations, required: true })
  damage_relations: DamageRelations;

  @Prop({ type: MoveDamageClass, default: null })
  move_damage_class: MoveDamageClass | null;
}

export const PokemonTypeSchema = SchemaFactory.createForClass(PokemonType);

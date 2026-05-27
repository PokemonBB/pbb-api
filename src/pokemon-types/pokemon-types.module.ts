import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonTypesService } from './pokemon-types.service';
import { PokemonTypesController } from './pokemon-types.controller';
import {
  PokemonType,
  PokemonTypeSchema,
} from '../schemas/pokemon-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PokemonType.name, schema: PokemonTypeSchema },
    ]),
  ],
  controllers: [PokemonTypesController],
  providers: [PokemonTypesService],
  exports: [PokemonTypesService],
})
export class PokemonTypesModule {}

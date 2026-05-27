import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { Pokemon, PokemonSchema } from '../schemas/pokemon.schema';
import { PokemonType, PokemonTypeSchema } from '../schemas/pokemon-type.schema';
import { Move, MoveSchema } from '../schemas/move.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pokemon.name, schema: PokemonSchema },
      { name: PokemonType.name, schema: PokemonTypeSchema },
      { name: Move.name, schema: MoveSchema },
    ]),
  ],
  controllers: [PokemonController],
  providers: [PokemonService],
  exports: [PokemonService],
})
export class PokemonModule {}

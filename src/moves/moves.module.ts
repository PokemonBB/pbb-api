import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Move, MoveSchema } from '../schemas/move.schema';
import { Pokemon, PokemonSchema } from '../schemas/pokemon.schema';
import { PokemonType, PokemonTypeSchema } from '../schemas/pokemon-type.schema';
import { MovesService } from './moves.service';
import { MovesController } from './moves.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Move.name, schema: MoveSchema },
      { name: PokemonType.name, schema: PokemonTypeSchema },
      { name: Pokemon.name, schema: PokemonSchema },
    ]),
  ],
  controllers: [MovesController],
  providers: [MovesService],
  exports: [MovesService],
})
export class MovesModule {}

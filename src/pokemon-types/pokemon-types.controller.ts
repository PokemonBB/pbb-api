import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { PokemonTypesService } from './pokemon-types.service';
import { UpdateDamageRelationDto } from './dto/update-damage-relation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { AdminRoleGuard } from '../users/guards/admin-role.guard';

@ApiTags('Pokemon')
@Controller('pokemon/types')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
@ApiCookieAuth('token')
export class PokemonTypesController {
  constructor(private readonly pokemonTypesService: PokemonTypesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all Pokémon types',
    description:
      'Retrieve the full list of Pokémon types sorted by id, including names, damage relations and move damage class.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all Pokémon types',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.pokemonTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a Pokémon type by id',
    description:
      'Retrieve a single Pokémon type by its numeric id, including names, damage relations and move damage class.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric id of the Pokémon type',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Pokémon type found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Type not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonTypesService.findById(id);
  }

  @Patch('damage-relation')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Update damage relation between two types (ADMIN/ROOT)',
    description:
      'Change the damage multiplier from an attacker type to a defender type. ' +
      "Both types are updated atomically: the attacker's *_to arrays and the defender's *_from arrays. " +
      'Uses the numeric type id (1–18), not the MongoDB _id. ' +
      'Multipliers: x2 (double damage), x0.5 (half damage), x0 (immune), x1 (neutral / remove relation).',
  })
  @ApiBody({
    type: UpdateDamageRelationDto,
    examples: {
      setHalfDamage: {
        summary: 'Steel deals half damage to Fairy',
        value: { attackerId: 9, defenderId: 18, multiplier: 'x0.5' },
      },
      setImmune: {
        summary: 'Normal has no effect on Ghost',
        value: { attackerId: 1, defenderId: 8, multiplier: 'x0' },
      },
      setNeutral: {
        summary: 'Remove special relation (set to neutral x1)',
        value: { attackerId: 9, defenderId: 18, multiplier: 'x1' },
      },
      selfReference: {
        summary: 'Dragon deals double damage to itself',
        value: { attackerId: 16, defenderId: 16, multiplier: 'x2' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Damage relation updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Damage relation updated successfully',
        },
        attacker: { type: 'object', description: 'Updated attacker type' },
        defender: { type: 'object', description: 'Updated defender type' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – only ADMIN or ROOT',
  })
  @ApiResponse({ status: 404, description: 'Type not found' })
  async updateDamageRelation(
    @Body(new ValidationPipe({ whitelist: true }))
    dto: UpdateDamageRelationDto,
  ) {
    const result = await this.pokemonTypesService.updateDamageRelation(dto);
    return {
      message: 'Damage relation updated successfully',
      ...result,
    };
  }
}

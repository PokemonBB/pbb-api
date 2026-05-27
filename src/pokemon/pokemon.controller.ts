import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
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
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { AdminRoleGuard } from '../users/guards/admin-role.guard';

@ApiTags('Pokemon')
@Controller('pokemon/pokemons')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
@ApiCookieAuth('token')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all Pokémon',
    description:
      'Retrieve the list of Pokémon sorted by id with pagination. Optional filter by type ids (comma-separated). Params: page (default 1), limit (default 10, max 100), types (e.g. 1,12,10). Types are populated.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'types',
    required: false,
    type: String,
    description:
      'Filter by type ids (comma-separated, e.g. 1,12,10). Pokémon with at least one of these types.',
    example: '10,3',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of Pokémon (data + pagination)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('types') typesParam?: string,
  ) {
    const typeIds = typesParam
      ? typesParam
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n) && n > 0)
      : undefined;
    return this.pokemonService.findAllPaginated(paginationDto, typeIds);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search Pokémon by id or name',
    description:
      'Search by numeric id (exact match) or by name (case-insensitive partial match). Use query param "query" plus pagination: page, limit.',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Numeric id (e.g. 25) or name substring (e.g. pika)',
    example: 'pika',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of matching Pokémon (data + pagination)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async search(
    @Query('query') query: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.pokemonService.searchPaginated(query, paginationDto);
  }

  @Get(':id/moves')
  @ApiOperation({
    summary: 'Get moves learnable by a Pokémon',
    description:
      'Returns all moves that this Pokémon can learn (learned_by_pokemon contains this Pokémon). Optional query param populate=type to include type details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric id of the Pokémon',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'populate',
    required: false,
    type: String,
    description: 'Set to "type" to populate move type',
    example: 'type',
  })
  @ApiResponse({
    status: 200,
    description: 'List of moves the Pokémon can learn',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pokémon not found' })
  async getMovesForPokemon(
    @Param('id', ParseIntPipe) id: number,
    @Query('populate') populateParam?: string,
  ) {
    const populateType = populateParam === 'type';
    return this.pokemonService.getMovesForPokemon(id, populateType);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a Pokémon by id',
    description:
      'Retrieve a single Pokémon by its numeric id, including types, base stats, height and weight.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric id of the Pokémon',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Pokémon found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pokémon not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Update a Pokémon (ADMIN/ROOT)',
    description:
      'Update types and/or stats of a Pokémon by its numeric id. Only ADMIN or ROOT can access. ' +
      'Types are given as slot + typeId (numeric id from types collection). Stats are name + base_stat.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric id of the Pokémon',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdatePokemonDto })
  @ApiResponse({ status: 200, description: 'Pokémon updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – only ADMIN or ROOT',
  })
  @ApiResponse({ status: 404, description: 'Pokémon not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdatePokemonDto,
  ) {
    return this.pokemonService.update(id, dto);
  }
}

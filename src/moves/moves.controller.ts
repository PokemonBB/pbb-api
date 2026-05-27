import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { MovesService } from './moves.service';
import { MoveDocument } from '../schemas/move.schema';
import { UpdateMoveDto } from './dto/update-move.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { AdminRoleGuard } from '../users/guards/admin-role.guard';

@ApiTags('Pokemon')
@Controller('pokemon/moves')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
@ApiCookieAuth('token')
export class MovesController {
  constructor(private readonly movesService: MovesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all moves',
    description:
      'Retrieve the list of moves sorted by id with pagination. Optionally populate type and/or learned_by_pokemon via query param populate=type,learned_by_pokemon.',
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
    name: 'populate',
    required: false,
    type: String,
    description:
      'Comma-separated list to populate: type, learned_by_pokemon. E.g. populate=type or populate=type,learned_by_pokemon',
    example: 'type,learned_by_pokemon',
  })
  @ApiQuery({
    name: 'types',
    required: false,
    type: String,
    description:
      'Filter by type ids (comma-separated). Moves with any of these types.',
    example: '1,2,10',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of moves (data + pagination)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('populate') populateParam?: string,
    @Query('types') typesParam?: string,
  ) {
    const populatePaths = populateParam
      ? populateParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const typeIds = typesParam
      ? typesParam
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n) && n > 0)
      : undefined;
    return this.movesService.findAllPaginated(
      paginationDto,
      populatePaths,
      typeIds,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a move by id',
    description:
      'Retrieve a single move by its numeric id, with type and learned_by_pokemon populated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric id of the move',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Move found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Move not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<MoveDocument> {
    return await this.movesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Update a move (ADMIN/ROOT)',
    description:
      'Update accuracy, power, pp, priority, type or learned_by_pokemon by move numeric id. Only ADMIN or ROOT can access.',
  })
  @ApiParam({
    name: 'id',
    description: 'Numeric id of the move',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateMoveDto })
  @ApiResponse({ status: 200, description: 'Move updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – only ADMIN or ROOT',
  })
  @ApiResponse({ status: 404, description: 'Move or type not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateMoveDto,
  ): Promise<MoveDocument> {
    return await this.movesService.update(id, dto);
  }
}

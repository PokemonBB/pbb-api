import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { ExportService } from '../export/export.service';
import { SeedService } from '../seed/seed.service';
import { ExportDto } from '../export/dto/export.dto';
import { SeedResetDto } from '../seed/dto/seed-reset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { RootRoleGuard } from '../users/guards/root-role.guard';

@ApiTags('Database')
@Controller('database')
@UseGuards(JwtAuthGuard, ActiveUserGuard, RootRoleGuard)
@ApiCookieAuth('token')
export class DatabaseController {
  constructor(
    private readonly exportService: ExportService,
    private readonly seedService: SeedService,
  ) {}

  @Get('collections')
  @ApiOperation({
    summary: 'List database collections (ROOT only)',
    description:
      'Returns the list of non-system collection names. Use for export selection and for seed reset selection.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of collection names',
    schema: {
      type: 'object',
      properties: {
        collections: {
          type: 'array',
          items: { type: 'string' },
          example: ['users', 'types', 'audits'],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – only ROOT users' })
  async getCollections(): Promise<{ collections: string[] }> {
    const collections = await this.exportService.getCollectionNames();
    return { collections };
  }

  @Post('export')
  @ApiOperation({
    summary: 'Export collections as JSON (ROOT only)',
    description:
      'Exports one, several or all database collections as a single JSON file. ' +
      'Request body can specify a list of collection names; if omitted or empty, all non-system collections are exported. ' +
      'Response is a downloadable JSON object where each key is a collection name and the value is an array of documents.',
  })
  @ApiBody({
    type: ExportDto,
    examples: {
      all: {
        summary: 'Export all collections',
        value: {},
      },
      empty: {
        summary: 'Export all collections (empty array)',
        value: { collections: [] },
      },
      selected: {
        summary: 'Export selected collections',
        value: { collections: ['types', 'users'] },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'JSON file with collection names as keys and arrays of documents as values. Content-Disposition: attachment.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: { type: 'object' },
          },
          example: {
            types: [{ id: 1, name: 'normal', color: '#A8A77A' }],
            users: [],
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – only ROOT users can export',
  })
  async export(
    @Body(new ValidationPipe({ whitelist: true })) dto: ExportDto,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const data = await this.exportService.getExportData(dto.collections ?? []);
    const filename = `export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    res
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .type('application/json')
      .send(JSON.stringify(data, null, 2));
  }

  @Post('seed/reset')
  @ApiOperation({
    summary: 'Reset database and re-seed (ROOT only)',
    description:
      'Drops collections and re-seeds from seed files. If body.collections is omitted or empty, all collections are dropped and all seed files applied. If body.collections is provided, only those collections are dropped and only those that have seed files are re-seeded. Only ROOT users can execute this.',
  })
  @ApiBody({
    type: SeedResetDto,
    examples: {
      all: {
        summary: 'Reset all collections',
        value: {},
      },
      empty: {
        summary: 'Reset all collections (empty array)',
        value: { collections: [] },
      },
      selected: {
        summary: 'Reset selected collections only',
        value: { collections: ['types', 'moves'] },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Database reset and re-seeded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Database reset and re-seeded successfully',
        },
        dropped: {
          type: 'array',
          items: { type: 'string' },
          example: ['users', 'audits', 'notifications', 'friendships'],
        },
        seeded: {
          type: 'array',
          items: { type: 'string' },
          example: ['users', 'audits'],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only ROOT users can reset the database',
  })
  async resetAndSeed(
    @Body(new ValidationPipe({ whitelist: true })) dto: SeedResetDto,
  ) {
    const result = await this.seedService.resetAndSeed(dto.collections);
    return {
      message: 'Database reset and re-seeded successfully',
      ...result,
    };
  }
}

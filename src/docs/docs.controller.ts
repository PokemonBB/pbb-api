import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DocsService } from './docs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { AdminRoleGuard } from '../users/guards/admin-role.guard';
import type { FastifyRequest } from 'fastify';

@ApiTags('Docs')
@Controller('docs')
@UseGuards(JwtAuthGuard, ActiveUserGuard, AdminRoleGuard)
@ApiCookieAuth('token')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get docs root',
    description:
      'Returns the root documentation directory with README.md content and children. Only ROOT and ADMIN users can access.',
  })
  @ApiResponse({
    status: 200,
    description: 'Documentation directory or file content',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['directory'] },
            name: { type: 'string' },
            path: { type: 'string', example: '/' },
            content: { type: 'string' },
            children: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['directory', 'file'] },
                  path: { type: 'string' },
                },
              },
            },
          },
        },
        {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['file'] },
            name: { type: 'string' },
            path: { type: 'string' },
            content: { type: 'string' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ROOT or ADMIN only' })
  @ApiResponse({ status: 404, description: 'Path not found' })
  getDocsRoot() {
    return this.docsService.getDocs('');
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search docs',
    description:
      'Search across folders, file names and file content. Returns matching files with line numbers and snippets. Only ROOT and ADMIN users can access.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
    example: 'MONGODB',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string', example: '/common/HEALTHCHECK' },
              name: { type: 'string', example: 'Healthcheck' },
              line: { type: 'number', example: 5 },
              snippet: {
                type: 'string',
                example: 'Used by [Gatus (pbb-status)]({STATUS_BASE_URL})',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ROOT or ADMIN only' })
  searchDocs(@Query('q') query: string) {
    return this.docsService.searchDocs(query || '');
  }

  @Get('*')
  @ApiOperation({
    summary: 'Get docs by path',
    description:
      'Returns documentation directory or file content by path. Use paths like "users" or "users/USER_VISIBILITY". Only ROOT and ADMIN users can access.',
  })
  @ApiResponse({
    status: 200,
    description: 'Documentation directory or file content',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['directory'] },
            name: { type: 'string' },
            path: { type: 'string', example: '/users' },
            content: { type: 'string' },
            children: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['directory', 'file'] },
                  path: { type: 'string' },
                },
              },
            },
          },
        },
        {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['file'] },
            name: { type: 'string' },
            path: { type: 'string', example: '/users/USER_VISIBILITY' },
            content: { type: 'string' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - ROOT or ADMIN only' })
  @ApiResponse({ status: 404, description: 'Path not found' })
  getDocsByPath(@Req() req: FastifyRequest) {
    const url = (req.url || '').split('?')[0];
    const pathMatch = url.match(/\/api\/docs\/?(.*)/);
    const path = pathMatch ? (pathMatch[1] || '').trim() : '';
    return this.docsService.getDocs(path);
  }
}

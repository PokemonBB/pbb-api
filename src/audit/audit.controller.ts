import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { AdminRoleGuard } from '../users/guards/admin-role.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditFilterDto } from './dto/audit-filter.dto';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Get all audit logs (ADMIN/ROOT)',
    description:
      'Retrieve paginated and filterable audit logs. Only accessible by ADMIN and ROOT users. All filter parameters are optional and can be combined.',
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
    name: 'username',
    required: false,
    type: String,
    description: 'Filter by username (partial, case-insensitive)',
    example: 'admin',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by userId (exact match)',
    example: '69806b5bb2d75f0114510877',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    enum: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'REGISTER',
      'LOGIN_FAILURE',
      'USE',
      'READ',
      'UNKNOWN',
    ],
    description: 'Filter by action',
  })
  @ApiQuery({
    name: 'resource',
    required: false,
    enum: [
      'USER',
      'AUTH',
      'INVITATION',
      'NOTIFICATION',
      'FRIENDSHIP',
      'UNKNOWN',
    ],
    description: 'Filter by resource',
  })
  @ApiQuery({
    name: 'resourceId',
    required: false,
    type: String,
    description: 'Filter by resourceId (exact match)',
    example: '69806b5bb2d75f0114510877',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Start date for range filter (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'End date for range filter (ISO 8601)',
    example: '2026-02-08T23:59:59.999Z',
  })
  @ApiCookieAuth('token')
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
          description: 'Audit log entries',
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 42 },
            totalPages: { type: 'number', example: 5 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: AuditFilterDto,
  ) {
    return this.auditService.findAllPaginated(paginationDto, filterDto);
  }
}

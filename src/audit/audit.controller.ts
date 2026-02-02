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

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Get all audit logs (Admin/Root only)',
    description:
      'Retrieve paginated audit logs. Only accessible by ADMIN and ROOT users.',
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
  @ApiCookieAuth('token')
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.auditService.findAllPaginated(paginationDto);
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthcheckService } from './healthcheck.service';

@ApiTags('Health')
@Controller('health')
export class HealthcheckController {
  constructor(private readonly healthcheckService: HealthcheckService) {}

  @Get('api')
  @ApiOperation({ summary: 'API health check' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  checkApi() {
    return this.healthcheckService.getApiStatus();
  }

  @Get('db')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({
    status: 200,
    description: 'Database is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Database is unavailable',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  checkDb() {
    return this.healthcheckService.getDbStatus();
  }
}

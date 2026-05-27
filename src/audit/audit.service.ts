import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Audit, AuditDocument } from '../schemas/audit.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditFilterDto } from './dto/audit-filter.dto';
import {
  getPaginationParams,
  createPaginatedResponse,
} from '../common/helpers/pagination.helper';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name)
    private auditModel: Model<AuditDocument>,
  ) {}

  async createAuditLog(auditData: {
    userId: string;
    username: string;
    action: string;
    resource: string;
    resourceId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }): Promise<Audit> {
    const audit = new this.auditModel(auditData);
    return audit.save();
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
    filterDto?: AuditFilterDto,
  ) {
    const { page, limit, skip } = getPaginationParams(paginationDto);
    const filter = this.buildFilter(filterDto);

    const [data, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments(filter).exec(),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  private buildFilter(filterDto?: AuditFilterDto): FilterQuery<AuditDocument> {
    if (!filterDto) return {};

    const filter: FilterQuery<AuditDocument> = {};

    if (filterDto.username) {
      filter.username = { $regex: new RegExp(filterDto.username, 'i') };
    }

    const exactFields = ['userId', 'action', 'resource', 'resourceId'] as const;
    for (const key of exactFields) {
      if (filterDto[key]) filter[key] = filterDto[key];
    }

    const dateRange = {
      ...(filterDto.dateFrom && { $gte: new Date(filterDto.dateFrom) }),
      ...(filterDto.dateTo && { $lte: new Date(filterDto.dateTo) }),
    };
    if (Object.keys(dateRange).length) filter.createdAt = dateRange;

    return filter;
  }
}

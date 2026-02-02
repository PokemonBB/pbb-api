import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit, AuditDocument } from '../schemas/audit.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
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

  async findAllPaginated(paginationDto: PaginationDto) {
    const { page, limit, skip } = getPaginationParams(paginationDto);

    const [data, total] = await Promise.all([
      this.auditModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditModel.countDocuments().exec(),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }
}

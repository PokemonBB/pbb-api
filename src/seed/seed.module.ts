import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UsersModule, AuditModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

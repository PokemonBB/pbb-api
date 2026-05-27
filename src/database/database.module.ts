import { Module } from '@nestjs/common';
import { DatabaseController } from './database.controller';
import { ExportModule } from '../export/export.module';
import { SeedModule } from '../seed/seed.module';

@Module({
  imports: [ExportModule, SeedModule],
  controllers: [DatabaseController],
  exports: [SeedModule],
})
export class DatabaseModule {}

import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../enums/user-role.enum';
import * as fs from 'fs';
import * as path from 'path';

interface SeedFile {
  filename: string;
  collection: string;
  service: any;
  checkMethod: string;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  async seedDatabase(): Promise<void> {
    this.logger.log('💾🔵 Starting database seed...');

    const seedFiles = this.getSeedFiles();

    for (const seedFile of seedFiles) {
      await this.seedCollection(seedFile);
    }

    this.logger.log('💾🟢 Database seed completed');
  }

  private getSeedFiles(): SeedFile[] {
    const seedDir = path.join(process.cwd(), 'seed');

    if (!fs.existsSync(seedDir)) {
      this.logger.warn('💾🔴 Seed directory does not exist');
      return [];
    }

    const files = fs
      .readdirSync(seedDir)
      .filter((file) => file.endsWith('.json'));
    const seedFiles: SeedFile[] = [];

    // Map files to collections and services
    for (const file of files) {
      const collection = file.replace('.json', '');

      switch (collection) {
        case 'users':
          seedFiles.push({
            filename: file,
            collection: 'users',
            service: this.usersService,
            checkMethod: 'findAll',
          });
          break;
        case 'audits':
          seedFiles.push({
            filename: file,
            collection: 'audits',
            service: this.auditService,
            checkMethod: 'findAllPaginated',
          });
          break;
        default:
          this.logger.warn(
            `💾🔴 No service mapping found for collection: ${collection}`,
          );
      }
    }

    return seedFiles;
  }

  private async seedCollection(seedFile: SeedFile): Promise<void> {
    try {
      // Check if collection is empty
      const isEmpty = await this.isCollectionEmpty(seedFile);

      if (!isEmpty) {
        this.logger.log(
          `💾🔴 Collection ${seedFile.collection} is not empty, skipping seed`,
        );
        return;
      }

      // Load and process seed data
      const seedPath = path.join(process.cwd(), 'seed', seedFile.filename);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

      if (!Array.isArray(data)) {
        this.logger.warn(
          `Seed file ${seedFile.filename} does not contain an array`,
        );
        return;
      }

      // Process data based on collection type
      await this.processSeedData(seedFile, data);

      this.logger.log(
        `Successfully seeded ${seedFile.collection} with ${data.length} records`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to seed ${seedFile.collection}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async isCollectionEmpty(seedFile: SeedFile): Promise<boolean> {
    try {
      if (seedFile.checkMethod === 'findAll') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const results = await seedFile.service[seedFile.checkMethod]();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return results.length === 0;
      } else if (seedFile.checkMethod === 'findAllPaginated') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const results = await seedFile.service[seedFile.checkMethod]({
          page: 1,
          limit: 1,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return results.pagination.total === 0;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Error checking if ${seedFile.collection} is empty:`,
        error,
      );
      return false;
    }
  }

  private async processSeedData(
    seedFile: SeedFile,
    data: any[],
  ): Promise<void> {
    switch (seedFile.collection) {
      case 'users':
        await this.seedUsers(data);
        break;
      case 'audits':
        await this.seedAudits(data);
        break;
      default:
        this.logger.warn(
          `No processing method for collection: ${seedFile.collection}`,
        );
    }
  }

  private async seedUsers(usersData: any[]): Promise<void> {
    for (const userData of usersData) {
      const user = await this.usersService.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        username: userData.username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        email: userData.email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        password: userData.password,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        role: userData.role as UserRole,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        active: userData.active,
      });

      this.logger.log(`User created: ${user.username} (${user.role})`);
    }
  }

  private async seedAudits(auditsData: any[]): Promise<void> {
    for (const auditData of auditsData) {
      await this.auditService.createAuditLog({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userId: auditData.userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        username: auditData.username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        action: auditData.action,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        resource: auditData.resource,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        resourceId: auditData.resourceId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        oldValues: auditData.oldValues,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        newValues: auditData.newValues,
      });

      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
        `Audit log created: ${auditData.action} on ${auditData.resource}`,
      );
    }
  }
}

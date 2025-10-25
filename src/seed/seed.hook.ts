import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SeedService } from './seed.service';

@Injectable()
export class SeedHook implements OnApplicationBootstrap {
  constructor(private readonly seedService: SeedService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedService.seedDatabase();
  }
}

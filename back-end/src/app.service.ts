import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeedService } from './seed/seed.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private seedService: SeedService,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.configService.get<string>('SEED_ON_BOOT') !== 'true') {
      return;
    }
    Logger.log('SEED_ON_BOOT=true — running seed', 'AppService');
    await this.seedService.execute();
  }
}

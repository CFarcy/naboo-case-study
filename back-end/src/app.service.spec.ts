import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { SeedService } from './seed/seed.service';

describe('AppService', () => {
  const buildModule = async (seedFlag: string | undefined) => {
    const seedExecute = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: SeedService, useValue: { execute: seedExecute } },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'SEED_ON_BOOT' ? seedFlag : undefined,
          },
        },
      ],
    }).compile();

    return { service: module.get(AppService), seedExecute };
  };

  it('does not seed when SEED_ON_BOOT is unset', async () => {
    const { service, seedExecute } = await buildModule(undefined);
    await service.onApplicationBootstrap();
    expect(seedExecute).not.toHaveBeenCalled();
  });

  it('does not seed when SEED_ON_BOOT is "false"', async () => {
    const { service, seedExecute } = await buildModule('false');
    await service.onApplicationBootstrap();
    expect(seedExecute).not.toHaveBeenCalled();
  });

  it('seeds when SEED_ON_BOOT is "true"', async () => {
    const { service, seedExecute } = await buildModule('true');
    await service.onApplicationBootstrap();
    expect(seedExecute).toHaveBeenCalledTimes(1);
  });
});

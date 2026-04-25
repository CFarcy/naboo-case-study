import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { ActivityModule } from './activity.module';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
describe('ActivityService', () => {
  let service: ActivityService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule, ActivityModule],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

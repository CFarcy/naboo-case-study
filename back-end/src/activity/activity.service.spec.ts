import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityService } from './activity.service';
import { ActivityModule } from './activity.module';
import { Activity } from './activity.schema';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';

describe('ActivityService', () => {
  let service: ActivityService;
  let activityModel: Model<Activity>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule, ActivityModule],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    activityModel = module.get<Model<Activity>>(getModelToken(Activity.name));
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

  describe('findByCity', () => {
    const ownerId = new Types.ObjectId();

    beforeAll(async () => {
      await activityModel.insertMany([
        {
          name: 'Tour Eiffel',
          city: 'Paris',
          description: 'iconic',
          price: 10,
          owner: ownerId,
        },
        {
          name: 'a.b literal',
          city: 'Paris',
          description: 'has a literal dot',
          price: 10,
          owner: ownerId,
        },
        {
          name: 'aXb regex bait',
          city: 'Paris',
          description: 'would match `a.b` regex',
          price: 10,
          owner: ownerId,
        },
      ]);
    });

    afterAll(async () => {
      await activityModel.deleteMany({});
    });

    it('treats regex metacharacters in user input as literals', async () => {
      const results = await service.findByCity('Paris', 'a.b');
      const names = results.map((a) => a.name).sort();
      expect(names).toEqual(['a.b literal']);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
import { User } from 'src/user/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { createLoaders } from './loaders';

describe('createLoaders.userById', () => {
  let userService: UserService;
  let module: TestingModule;

  const createUser = () =>
    userService.createUser({
      email: randomUUID() + '@test.com',
      password: 'password',
      firstName: 'first',
      lastName: 'last',
    });

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule, UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    await closeInMongodConnection();
  });

  it('batches N parallel loads into a single DB query', async () => {
    const users = await Promise.all([createUser(), createUser(), createUser()]);
    const userModel = module.get<Model<User>>(getModelToken(User.name));
    const findSpy = jest.spyOn(userModel, 'find');

    const loaders = createLoaders(userService);
    const results = await Promise.all(
      users.map((u) => loaders.userById.load(u.id)),
    );

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(results.map((u) => u.id)).toEqual(users.map((u) => u.id));
    findSpy.mockRestore();
  });

  it('caches repeated loads for the same id', async () => {
    const user = await createUser();
    const userModel = module.get<Model<User>>(getModelToken(User.name));
    const findSpy = jest.spyOn(userModel, 'find');

    const loaders = createLoaders(userService);
    await loaders.userById.load(user.id);
    await loaders.userById.load(user.id);

    expect(findSpy).toHaveBeenCalledTimes(1);
    findSpy.mockRestore();
  });
});

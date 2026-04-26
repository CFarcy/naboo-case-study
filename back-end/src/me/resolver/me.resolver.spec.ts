import { Test, TestingModule } from '@nestjs/testing';
import { MeResolver } from './me.resolver';
import { UserService } from '../../user/user.service';
import { ContextWithJWTPayload } from '../../auth/types/context';

describe('MeResolver', () => {
  let resolver: MeResolver;
  let userService: { setDebugMode: jest.Mock; getById: jest.Mock };

  const context = {
    jwtPayload: { id: 'user-1', role: 'admin' },
  } as unknown as ContextWithJWTPayload;

  beforeEach(async () => {
    userService = {
      setDebugMode: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', debugModeEnabled: true }),
      getById: jest.fn().mockResolvedValue({ id: 'user-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [MeResolver, { provide: UserService, useValue: userService }],
    }).compile();

    resolver = module.get(MeResolver);
  });

  it('setDebugMode forwards user id and enabled value', async () => {
    await resolver.setDebugMode(context, true);
    expect(userService.setDebugMode).toHaveBeenCalledWith({
      userId: 'user-1',
      enabled: true,
    });
  });
});

import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AdminGuard } from './admin.guard';

const buildContext = (
  jwtPayload: { role?: string } | null,
): ExecutionContext => {
  const gqlCtx = { jwtPayload };
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => gqlCtx,
  } as unknown as GqlExecutionContext);
  return {} as ExecutionContext;
};

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws Unauthorized when no jwt payload is present', async () => {
    await expect(guard.canActivate(buildContext(null))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws Forbidden when role is not admin', async () => {
    await expect(
      guard.canActivate(buildContext({ role: 'user' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows access when role is admin', async () => {
    await expect(
      guard.canActivate(buildContext({ role: 'admin' })),
    ).resolves.toBe(true);
  });
});

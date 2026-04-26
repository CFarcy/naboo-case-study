import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkResolver } from './bookmark.resolver';
import { UserService } from '../../user/user.service';
import { ContextWithJWTPayload } from '../../auth/types/context';

describe('BookmarkResolver', () => {
  let resolver: BookmarkResolver;
  let userService: {
    addBookmark: jest.Mock;
    removeBookmark: jest.Mock;
    reorderBookmarks: jest.Mock;
  };

  const context = {
    jwtPayload: { id: 'user-1' },
  } as unknown as ContextWithJWTPayload;

  beforeEach(async () => {
    userService = {
      addBookmark: jest.fn().mockResolvedValue({ id: 'user-1' }),
      removeBookmark: jest.fn().mockResolvedValue({ id: 'user-1' }),
      reorderBookmarks: jest.fn().mockResolvedValue({ id: 'user-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkResolver,
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    resolver = module.get(BookmarkResolver);
  });

  it('addBookmark forwards user id and activity id', async () => {
    await resolver.addBookmark(context, 'activity-1');
    expect(userService.addBookmark).toHaveBeenCalledWith(
      'user-1',
      'activity-1',
    );
  });

  it('removeBookmark forwards user id and activity id', async () => {
    await resolver.removeBookmark(context, 'activity-1');
    expect(userService.removeBookmark).toHaveBeenCalledWith(
      'user-1',
      'activity-1',
    );
  });

  it('reorderBookmarks forwards user id and ordered ids', async () => {
    await resolver.reorderBookmarks(context, ['a', 'b', 'c']);
    expect(userService.reorderBookmarks).toHaveBeenCalledWith('user-1', [
      'a',
      'b',
      'c',
    ]);
  });
});

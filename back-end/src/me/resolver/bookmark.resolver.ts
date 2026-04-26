import {
  Args,
  Context,
  ID,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { ContextWithJWTPayload } from '../../auth/types/context';
import { Activity } from '../../activity/activity.schema';
import { User } from '../../user/user.schema';
import { UserService } from '../../user/user.service';

@Resolver(() => User)
export class BookmarkResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => [Activity])
  async bookmarks(@Parent() user: User): Promise<Activity[]> {
    await user.populate('bookmarks');
    return user.bookmarks as unknown as Activity[];
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async addBookmark(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId', { type: () => ID }) activityId: string,
  ): Promise<User> {
    return this.userService.addBookmark(context.jwtPayload.id, activityId);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async removeBookmark(
    @Context() context: ContextWithJWTPayload,
    @Args('activityId', { type: () => ID }) activityId: string,
  ): Promise<User> {
    return this.userService.removeBookmark(context.jwtPayload.id, activityId);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async reorderBookmarks(
    @Context() context: ContextWithJWTPayload,
    @Args('orderedIds', { type: () => [ID] }) orderedIds: string[],
  ): Promise<User> {
    return this.userService.reorderBookmarks(context.jwtPayload.id, orderedIds);
  }
}

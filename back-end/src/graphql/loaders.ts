import DataLoader = require('dataloader');
import { NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.schema';

export interface GraphQLLoaders {
  userById: DataLoader<string, User>;
}

export function createLoaders(userService: UserService): GraphQLLoaders {
  return {
    userById: new DataLoader<string, User>(async (ids) => {
      const users = await userService.findManyByIds(ids);
      return users.map(
        (user, i) => user ?? new NotFoundException(`User ${ids[i]} not found`),
      );
    }),
  };
}

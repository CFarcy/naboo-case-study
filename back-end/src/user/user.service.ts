import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { Activity } from 'src/activity/activity.schema';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

function toObjectId(value: string, fieldName: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException(`${fieldName} is not a valid id`);
  }
  return new Types.ObjectId(value);
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Activity.name)
    private activityModel: Model<Activity>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email }).exec();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findManyByIds(ids: readonly string[]): Promise<(User | null)[]> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    const users = await this.userModel
      .find({ _id: { $in: validIds.map((id) => new Types.ObjectId(id)) } })
      .exec();
    const byId = new Map(users.map((user) => [String(user._id), user]));
    return ids.map((id) => byId.get(id) ?? null);
  }

  async createUser(
    data: SignUpInput & {
      role?: User['role'];
    },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save();
  }

  async updateToken(id: string, token: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.token = token;
    return user.save();
  }

  async countDocuments(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async addBookmark(userId: string, activityId: string): Promise<User> {
    const objectId = toObjectId(activityId, 'activityId');
    const activityExists = await this.activityModel
      .exists({ _id: objectId })
      .exec();
    if (!activityExists) {
      throw new NotFoundException('Activity not found');
    }
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { bookmarks: objectId } },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async removeBookmark(userId: string, activityId: string): Promise<User> {
    const objectId = toObjectId(activityId, 'activityId');
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { bookmarks: objectId } },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async reorderBookmarks(userId: string, orderedIds: string[]): Promise<User> {
    const nextObjectIds = orderedIds.map((id) => toObjectId(id, 'orderedIds'));
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const current = user.bookmarks.map((id) => id.toString()).sort();
    const next = nextObjectIds.map((id) => id.toString()).sort();
    const sameSet =
      current.length === next.length &&
      current.every((id, i) => id === next[i]);
    if (!sameSet) {
      throw new BadRequestException(
        'orderedIds must contain exactly the current bookmark ids',
      );
    }
    user.bookmarks = nextObjectIds;
    return user.save();
  }

  async setDebugMode({
    userId,
    enabled,
  }: {
    userId: string;
    enabled: boolean;
  }): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        debugModeEnabled: enabled,
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

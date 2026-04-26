import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
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
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { bookmarks: new Types.ObjectId(activityId) } },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async removeBookmark(userId: string, activityId: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { bookmarks: new Types.ObjectId(activityId) } },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async reorderBookmarks(userId: string, orderedIds: string[]): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const current = user.bookmarks.map((id) => id.toString()).sort();
    const next = [...orderedIds].sort();
    const sameSet =
      current.length === next.length &&
      current.every((id, i) => id === next[i]);
    if (!sameSet) {
      throw new BadRequestException(
        'orderedIds must contain exactly the current bookmark ids',
      );
    }
    user.bookmarks = orderedIds.map((id) => new Types.ObjectId(id));
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

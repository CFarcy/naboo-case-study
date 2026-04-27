import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { Activity } from 'src/activity/activity.schema';
import { randomUUID } from 'crypto';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';

describe('UserService', () => {
  let userService: UserService;
  let activityModel: Model<Activity>;
  let module: TestingModule;

  const createUser = () =>
    userService.createUser({
      email: randomUUID() + '@test.com',
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

  const createActivity = (ownerId: string) =>
    activityModel.create({
      name: 'name',
      city: 'city',
      description: 'description',
      price: 10,
      owner: ownerId,
    });

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TestModule, UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);
    activityModel = module.get<Model<Activity>>(getModelToken(Activity.name));
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('basic create / get', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const fetchedUser = await userService.getById(user.id);

    expect(fetchedUser).toMatchObject({
      email,
      firstName: 'firstName',
      lastName: 'lastName',
    });
  });

  describe('bookmarks', () => {
    it('addBookmark appends a new id and is idempotent', async () => {
      const user = await createUser();
      const activity = await createActivity(user.id);

      const after1 = await userService.addBookmark(user.id, activity.id);
      const after2 = await userService.addBookmark(user.id, activity.id);

      expect(after1.bookmarks.map((id) => id.toString())).toEqual([
        activity.id,
      ]);
      expect(after2.bookmarks.map((id) => id.toString())).toEqual([
        activity.id,
      ]);
    });

    it('removeBookmark pulls the id and no-ops when absent', async () => {
      const user = await createUser();
      const activity = await createActivity(user.id);

      await userService.addBookmark(user.id, activity.id);
      const removed = await userService.removeBookmark(user.id, activity.id);
      const removedAgain = await userService.removeBookmark(
        user.id,
        activity.id,
      );

      expect(removed.bookmarks).toHaveLength(0);
      expect(removedAgain.bookmarks).toHaveLength(0);
    });

    it('reorderBookmarks updates the order when set matches', async () => {
      const user = await createUser();
      const a = await createActivity(user.id);
      const b = await createActivity(user.id);
      const c = await createActivity(user.id);

      await userService.addBookmark(user.id, a.id);
      await userService.addBookmark(user.id, b.id);
      await userService.addBookmark(user.id, c.id);

      const reordered = await userService.reorderBookmarks(user.id, [
        c.id,
        a.id,
        b.id,
      ]);

      expect(reordered.bookmarks.map((id) => id.toString())).toEqual([
        c.id,
        a.id,
        b.id,
      ]);
    });

    it('addBookmark rejects an unknown activity id', async () => {
      const user = await createUser();
      const unknownId = new Types.ObjectId().toString();

      await expect(
        userService.addBookmark(user.id, unknownId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects malformed activity ids with BadRequestException', async () => {
      const user = await createUser();

      await expect(
        userService.addBookmark(user.id, 'not-an-objectid'),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        userService.removeBookmark(user.id, 'not-an-objectid'),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        userService.reorderBookmarks(user.id, ['not-an-objectid']),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('setDebugMode toggles the persisted debugModeEnabled field', async () => {
      const user = await createUser();

      const enabled = await userService.setDebugMode({
        userId: user.id,
        enabled: true,
      });
      expect(enabled.debugModeEnabled).toBe(true);

      const disabled = await userService.setDebugMode({
        userId: user.id,
        enabled: false,
      });
      expect(disabled.debugModeEnabled).toBe(false);
    });
  });

  describe('findManyByIds', () => {
    it('returns users in the same order as input ids, with null for missing', async () => {
      const a = await createUser();
      const b = await createUser();
      const missing = new Types.ObjectId().toString();

      const result = await userService.findManyByIds([b.id, missing, a.id]);

      expect(result.map((u) => u?.id ?? null)).toEqual([b.id, null, a.id]);
    });

    it('issues a single find query for N ids', async () => {
      const a = await createUser();
      const b = await createUser();
      const c = await createUser();

      const userModel = userService['userModel'] as Model<unknown>;
      const findSpy = jest.spyOn(userModel, 'find');

      await userService.findManyByIds([a.id, b.id, c.id]);

      expect(findSpy).toHaveBeenCalledTimes(1);
      findSpy.mockRestore();
    });

    it('skips invalid ids without throwing', async () => {
      const a = await createUser();

      const result = await userService.findManyByIds(['not-an-id', a.id]);

      expect(result[0]).toBeNull();
      expect(result[1]?.id).toBe(a.id);
    });
  });

  describe('bookmarks (cont.)', () => {
    it('reorderBookmarks rejects a different set', async () => {
      const user = await createUser();
      const a = await createActivity(user.id);
      const b = await createActivity(user.id);
      const other = await createActivity(user.id);

      await userService.addBookmark(user.id, a.id);
      await userService.addBookmark(user.id, b.id);

      await expect(
        userService.reorderBookmarks(user.id, [a.id, other.id]),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});

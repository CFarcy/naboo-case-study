import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mongoose from 'mongoose';

const mongods = new Set<MongoMemoryServer>();

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      const mongod = await MongoMemoryServer.create();
      mongods.add(mongod);
      const uri = mongod.getUri();
      return {
        uri,
        ...options,
      };
    },
  });

export const closeInMongodConnection = async () => {
  try {
    await mongoose.disconnect();
    await Promise.all(Array.from(mongods).map((mongod) => mongod.stop()));
  } finally {
    mongods.clear();
  }
};

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), rootMongooseTestModule()],
  exports: [ConfigModule, MongooseModule],
})
export class TestModule {}

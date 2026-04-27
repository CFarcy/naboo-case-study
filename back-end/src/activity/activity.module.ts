import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ActivityService } from './activity.service';
import { Activity, ActivitySchema } from './activity.schema';
import { ActivityResolver } from './activity.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
    ]),
    AuthModule,
  ],
  exports: [ActivityService],
  providers: [ActivityService, ActivityResolver],
})
export class ActivityModule {}

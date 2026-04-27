import { Module, UnauthorizedException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GqlThrottlerGuard } from './auth/gql-throttler.guard';
import { MeModule } from './me/me.module';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PayloadDto } from './auth/types/jwtPayload.dto';
import { UserService } from './user/user.service';
import { createLoaders } from './graphql/loaders';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [JwtModule, UserModule],
      inject: [JwtService, ConfigService, UserService],
      useFactory: async (
        jwtService: JwtService,
        configService: ConfigService,
        userService: UserService,
      ) => {
        const secret = configService.get<string>('JWT_SECRET');
        return {
          autoSchemaFile: 'schema.gql',
          sortSchema: true,
          playground: true,
          buildSchemaOptions: { numberScalarMode: 'integer' },
          context: async ({ req, res }: { req: Request; res: Response }) => {
            const token =
              req.headers.jwt ?? (req.cookies && req.cookies['jwt']);

            let jwtPayload: PayloadDto | null = null;
            if (token) {
              try {
                jwtPayload = (await jwtService.verifyAsync(token, {
                  secret,
                })) as PayloadDto;
              } catch (error) {
                throw new UnauthorizedException(error);
              }
            }

            return {
              jwtPayload,
              loaders: createLoaders(userService),
              req,
              res,
            };
          },
        };
      },
    }),
    AuthModule,
    UserModule,
    MeModule,
    ActivityModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
  ],
})
export class BaseAppModule {}

@Module({
  imports: [
    BaseAppModule,
    MongooseModule.forRootAsync({
      useFactory: () => {
        return { uri: process.env.MONGO_URI };
      },
    }),
  ],
})
export class AppModule {}

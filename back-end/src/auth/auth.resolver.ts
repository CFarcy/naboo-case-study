import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { CookieOptions } from 'express';
import { SignInDto, SignInInput, SignUpInput } from './types';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.schema';

const AUTH_THROTTLE = { default: { ttl: 60_000, limit: 5 } };

const buildJwtCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  ...(process.env.FRONTEND_DOMAIN && process.env.FRONTEND_DOMAIN !== 'localhost'
    ? { domain: process.env.FRONTEND_DOMAIN }
    : {}),
});

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Throttle(AUTH_THROTTLE)
  @Mutation(() => SignInDto)
  async login(
    @Args('signInInput') loginUserDto: SignInInput,
    @Context() ctx: any,
  ): Promise<SignInDto> {
    const data = await this.authService.signIn(loginUserDto);
    ctx.res.cookie('jwt', data.access_token, buildJwtCookieOptions());
    return data;
  }

  @Throttle(AUTH_THROTTLE)
  @Mutation(() => User)
  async register(
    @Args('signUpInput') createUserDto: SignUpInput,
  ): Promise<User> {
    return this.authService.signUp(createUserDto);
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: any): Promise<boolean> {
    ctx.res.clearCookie('jwt', buildJwtCookieOptions());
    return true;
  }
}

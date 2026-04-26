import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import type { AuthUser } from './types/auth-user.type';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import type { Response } from 'express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

type AuthRequest = {
  user: AuthUser;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ auth: {} })
  @Post('signup')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Throttle({ auth: {} })
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Request() req: AuthRequest) {
    console.log('User authenticated successfully:', req.user);
    return this.authService.login(req.user);
  }

  @SkipThrottle()
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  async getProtectedResource(@Request() req: AuthRequest): Promise<AuthUser> {
    const rawUser = (req as unknown as { user?: unknown }).user;

    if (!rawUser || typeof rawUser !== 'object') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const authUser = rawUser as { id?: unknown };

    if (typeof authUser.id !== 'string') {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.authService.validateJwtUser(authUser.id);
  }

  @SkipThrottle()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @SkipThrottle()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req: AuthRequest, @Res() res: Response) {
    console.log('Google OAuth callback successful', req.user);
    const result = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/api/auth/callback?${new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      userId: result.id,
      email: result.email,
      name: result.name,
      avatarUrl: result.avatarUrl ?? '',
    }).toString()}`;

    return res.redirect(redirectUrl);
  }

  @Throttle({ auth: {} })
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req: AuthRequest) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: AuthUser): Promise<void> {
    await this.authService.logout(user.id);
  }
}

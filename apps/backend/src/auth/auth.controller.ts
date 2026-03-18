import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import type { AuthUser } from './types/auth-user.type';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';

type AuthRequest = {
  user: AuthUser;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Request() req: AuthRequest) {
    console.log('User authenticated successfully:', req.user);
    return this.authService.login(req.user);
  }

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

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req: AuthRequest) {
    return this.authService.refreshToken(req.user.id);
  }
}

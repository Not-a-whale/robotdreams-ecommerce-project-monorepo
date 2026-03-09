import { Body, Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

type AuthUserResponse = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

type AuthRequest = {
  user: AuthUserResponse;
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
  login(@Request() req: AuthRequest): AuthUserResponse {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatarUrl: req.user.avatarUrl ?? null,
    };
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtectedResource(@Request() req: AuthRequest): AuthUserResponse {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatarUrl: req.user.avatarUrl ?? null,
    };
  }
}

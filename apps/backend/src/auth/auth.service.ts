import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './config/refresh.config';
import type { ConfigType } from '@nestjs/config';
import type { AuthUser } from './types/auth-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  private normalizeAvatarFileId(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    return this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      avatarFileId: this.normalizeAvatarFileId(user.avatarFileId),
    };
  }
  async login(user: AuthUser) {
    const { accessToken, refreshToken } = await this.generateToken(user.id, user.name);
    const hashedRT = await hash(refreshToken);
    await this.userService.updateHashedRefreshToken(user.id, hashedRT);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      avatarFileId: this.normalizeAvatarFileId(user.avatarFileId),
      accessToken,
      refreshToken,
    };
  }

  async generateToken(userId: string, name?: string) {
    const payload = { sub: userId, name };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    const hashedRT = await hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRT);
    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('Invalid token');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      avatarFileId: this.normalizeAvatarFileId(user.avatarFileId),
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('Invalid token');
    if (!user.hashedRefreshToken) throw new UnauthorizedException('Invalid token');

    const isRefreshTokenValid = await verify(user.hashedRefreshToken, refreshToken);
    if (!isRefreshTokenValid) throw new UnauthorizedException('Invalid token');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      avatarFileId: this.normalizeAvatarFileId(user.avatarFileId),
    };
  }

  async refreshToken(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('Invalid token');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      avatarFileId: this.normalizeAvatarFileId(user.avatarFileId),
      ...(await this.generateToken(user.id, user.name)),
    };
  }

  async validateGoogleUser(profile: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(profile.email);

    if (existingUser) {
      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        avatarUrl: existingUser.avatarUrl ?? null,
        avatarFileId: this.normalizeAvatarFileId(existingUser.avatarFileId),
      };
    }

    const createdUser = await this.userService.create({
      email: profile.email,
      name: profile.name,
      password: randomUUID(),
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      avatarUrl: createdUser.avatarUrl ?? null,
      avatarFileId: this.normalizeAvatarFileId(createdUser.avatarFileId),
    };
  }
}

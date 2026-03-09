import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    return this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    console.log('Validating user:', { email, user });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
    };
  }
  async login(userId: number, name?: string) {
    const { accessToken } = await this.generateToken(userId, name);
    return {
      id: userId,
      name,
      accessToken,
    };
  }

  async generateToken(userId: number, name?: string) {
    const payload = { sub: userId, name };
    const [accessToken] = await Promise.all([this.jwtService.signAsync(payload)]);
    return { accessToken };
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findById(String(userId));
    if (!user) throw new UnauthorizedException('Invalid token');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
    };
  }
}

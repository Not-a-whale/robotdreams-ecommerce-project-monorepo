import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { UserRole } from './enums/user-role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.userService.create(createUserDto);
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string): Promise<UserEntity> {
    return await this.userService.findById(id);
  }

  @Get(':email')
  @UseGuards(JwtAuthGuard)
  async findByEmail(@Param('email') email: string): Promise<UserEntity | null> {
    return await this.userService.findByEmail(email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAll(): Promise<UserEntity[]> {
    return await this.userService.getAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<{ message: string }> {
    const actor = await this.userService.findById(currentUser.id);
    if (currentUser.id !== id && actor?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own account');
    }
    return await this.userService.deleteById(id);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthUser) {
    return this.userService.findById(user.id);
  }
}

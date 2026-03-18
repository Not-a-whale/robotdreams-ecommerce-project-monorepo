import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

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
  async findByEmail(@Param('email') email: string): Promise<UserEntity | null> {
    return await this.userService.findByEmail(email);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(): Promise<UserEntity[]> {
    return await this.userService.getAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteById(@Param('id') id: string): Promise<{ message: string }> {
    return await this.userService.deleteById(id);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: { sub: string }) {
    return this.userService.findById(user.sub);
  }
}

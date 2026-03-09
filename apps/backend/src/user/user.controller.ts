import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.userService.create(createUserDto);
  }

  @Get('id/:id')
  async findById(@Param('id') id: string): Promise<UserEntity> {
    return await this.userService.findById(id);
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string): Promise<UserEntity | null> {
    return await this.userService.findByEmail(email);
  }

  @Get()
  async getAll(): Promise<UserEntity[]> {
    return await this.userService.getAll();
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<{ message: string }> {
    return await this.userService.deleteById(id);
  }
}

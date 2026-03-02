import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(createUserDto);
  }

  @Get(':email')
  findByEmail(@Param('email') email: string): Promise<UserEntity | null> {
    return this.userService.findByEmail(email);
  }

  @Get()
  getAll(): Promise<UserEntity[]> {
    return this.userService.getAll();
  }

  @Delete(':id')
  deleteById(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.deleteById(id);
  }
}

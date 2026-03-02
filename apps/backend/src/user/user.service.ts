import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { password, ...user } = createUserDto;
    const hashedPassword = await hash(password);
    return await this.dataSource.getRepository(UserEntity).save({
      ...user,
      password: hashedPassword,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.dataSource.getRepository(UserEntity).findOne({ where: { email } });
    console.log('User found by email:', user);
    return user;
  }

  async getAll(): Promise<UserEntity[]> {
    return this.dataSource.getRepository(UserEntity).find();
  }

  async deleteById(id: string): Promise<{ message: string }> {
    const result = await this.dataSource.getRepository(UserEntity).delete({ id });

    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}

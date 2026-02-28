import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;
    const hashedPassword = await hash(password);
    return await this.dataSource.getRepository(UserEntity).save({
      ...user,
      password: hashedPassword,
    });
  }

  async findByEmail(email: string) {
    return this.dataSource.getRepository(UserEntity).findOne({ where: { email } });
  }

  async getAll() {
    return this.dataSource.getRepository(UserEntity).find();
  }
}

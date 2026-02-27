import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<ProductEntity[]> {
    return this.dataSource
      .getRepository(ProductEntity)
      .createQueryBuilder('product')
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }
}

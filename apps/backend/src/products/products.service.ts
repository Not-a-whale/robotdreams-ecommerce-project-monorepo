import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(category?: string): Promise<ProductEntity[]> {
    const qb = this.dataSource
      .getRepository(ProductEntity)
      .createQueryBuilder('product')
      .orderBy('product.createdAt', 'DESC');

    if (category && category !== 'all') {
      qb.andWhere('product.categorySlug = :category', { category });
    }

    return qb.getMany();
  }
}

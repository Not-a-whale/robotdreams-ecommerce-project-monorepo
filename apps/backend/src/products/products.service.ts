import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductEntity } from './product.entity';
import { decodeCursor, encodeCursor } from './utils/cursor.util';
import { SortOption } from './types/sort-options.type';
import { GetProductsDto } from './dto/get-products.dto';

export interface PaginatedProducts {
  items: ProductEntity[];
  nextCursor: string | null;
  hasMore: boolean;
}

const SORT_CONFIG: Record<SortOption, { field: 'createdAt' | 'price'; direction: 'ASC' | 'DESC' }> =
  {
    newest: { field: 'createdAt', direction: 'DESC' },
    oldest: { field: 'createdAt', direction: 'ASC' },
    price_desc: { field: 'price', direction: 'DESC' },
    price_asc: { field: 'price', direction: 'ASC' },
  };

@Injectable()
export class ProductsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(query: GetProductsDto): Promise<PaginatedProducts> {
    const { category, search, sort = 'newest', cursor, limit = 20 } = query;

    const { field, direction } = SORT_CONFIG[sort];
    const operator = direction === 'DESC' ? '<' : '>';

    const qb = this.dataSource
      .getRepository(ProductEntity)
      .createQueryBuilder('product')
      .orderBy(`product.${field}`, direction)
      .addOrderBy('product.id', direction)
      .take(limit + 1);

    if (category && category !== 'all') {
      qb.andWhere('product.categorySlug = :category', { category });
    }

    if (search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);

      if (decoded.sort === sort) {
        qb.andWhere(
          `(product.${field} ${operator} :cursorValue)
           OR (product.${field} = :cursorValue AND product.id ${operator} :cursorId)`,
          { cursorValue: decoded.sortValue, cursorId: decoded.id },
        );
      }
    }

    const rows = await qb.getMany();

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    const last = items[items.length - 1];
    const nextCursor = hasMore && last ? encodeCursor(this.buildCursor(last, sort, field)) : null;

    return { items, nextCursor, hasMore };
  }

  private buildCursor(product: ProductEntity, sort: SortOption, field: 'createdAt' | 'price') {
    const sortValue =
      field === 'createdAt' ? product.createdAt.toISOString() : String(product.price);

    return {
      sort,
      sortValue,
      id: String(product.id),
    };
  }
}

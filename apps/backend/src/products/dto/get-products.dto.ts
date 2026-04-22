import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import * as sortOptionsType from '../types/sort-options.type';

export class GetProductsDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(sortOptionsType.SORT_OPTIONS)
  sort?: sortOptionsType.SortOption = 'newest';

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

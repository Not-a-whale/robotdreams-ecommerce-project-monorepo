import { Controller, Get, Param, Query } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';

@SkipThrottle({ global: true, auth: true })
@Throttle({ products: {} })
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get()
  findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query);
  }
}

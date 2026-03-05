import { Controller, Post, Body, Headers, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getAll() {
    return this.ordersService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Query('sync') sync?: string,
  ) {
    if (sync === 'true') {
      return this.ordersService.createOrder(dto, idempotencyKey);
    }

    return this.ordersService.createOrderAsync(dto, idempotencyKey);
  }
}

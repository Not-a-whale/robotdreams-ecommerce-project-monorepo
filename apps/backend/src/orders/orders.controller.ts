import { Controller, Post, Body, Headers, Get } from '@nestjs/common';
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
  create(@Body() dto: CreateOrderDto, @Headers('idempotency-key') idempotencyKey: string) {
    return this.ordersService.createOrder(dto, idempotencyKey);
  }
}

import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getAll(@CurrentUser() user: AuthUser) {
    return this.ordersService.findAll({ userId: user.id });
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Query('sync') sync: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    const safeDto: CreateOrderDto = { ...dto, userId: user.id };
    if (sync === 'true') {
      return this.ordersService.createOrder(safeDto, idempotencyKey);
    }
    return this.ordersService.createOrderAsync(safeDto, idempotencyKey);
  }
}

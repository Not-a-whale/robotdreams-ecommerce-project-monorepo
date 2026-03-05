import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductEntity } from 'src/products/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from './order-item-entity';
import { OrderEntity } from './entities/order.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { OrdersResolver } from './orders-resolver';
import { OrderItemResolver } from './order-item.resolver';
import { ProductsModule } from 'src/products/products.module';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, ProductEntity, UserEntity]),
    ProductsModule,
    RabbitMQModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersResolver, OrderItemResolver],
})
export class OrdersModule {}

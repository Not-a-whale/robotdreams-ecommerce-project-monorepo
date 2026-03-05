import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemEntity } from '../orders/order-item-entity';
import { ProductEntity } from '../products/product.entity';
import { ProcessedMessageEntity } from '../orders/entities/processed-message.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { OrdersWorkerService } from './order-worker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, ProductEntity, ProcessedMessageEntity]),
    RabbitMQModule,
  ],
  providers: [OrdersWorkerService],
})
export class WorkerModule {}

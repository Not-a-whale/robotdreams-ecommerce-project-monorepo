import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderItemEntity } from '../orders/order-item-entity';
import { ProductEntity } from '../products/product.entity';
import { ProcessedMessageEntity } from '../orders/entities/processed-message.entity';
import { RabbitMQService, OrderMessage } from '../rabbitmq/rabbitmq.service';
import type { Message } from 'amqplib';
import { OrderEntity } from 'src/orders/entities/order.entity';

@Injectable()
export class OrdersWorkerService implements OnModuleInit {
  private readonly logger = new Logger(OrdersWorkerService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProcessedMessageEntity)
    private readonly processedMessageRepository: Repository<ProcessedMessageEntity>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    if (process.env.WORKER_MODE === 'true') {
      await this.startConsuming();
    }
  }

  async startConsuming() {
    try {
      const channel = this.rabbitMQService.getChannel();
      const queue = this.rabbitMQService.getOrdersQueue();

      await channel.prefetch(1);

      this.logger.log(`🐰 Worker started, consuming from ${queue}`);

      await channel.consume(
        queue,
        (msg) => {
          if (msg) {
            void this.handleMessage(msg);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      this.logger.error('Failed to start consuming', error);
      throw error;
    }
  }

  private async handleMessage(msg: Message) {
    const channel = this.rabbitMQService.getChannel();
    let orderMessage: OrderMessage | null = null;

    try {
      const parsedOrderMessage = JSON.parse(msg.content.toString()) as OrderMessage;
      orderMessage = parsedOrderMessage;

      this.logger.log(
        `📦 Processing: ${parsedOrderMessage.messageId}, ` +
          `order: ${parsedOrderMessage.orderId}, ` +
          `attempt: ${parsedOrderMessage.attempt + 1}/3`,
      );

      await this.processOrder(parsedOrderMessage);

      channel.ack(msg);

      this.logger.log(`✅ Success: ${parsedOrderMessage.messageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error: ${orderMessage?.messageId ?? 'unknown'}: ${errorMessage}`);

      if (!orderMessage) {
        channel.nack(msg, false, false);
        return;
      }

      this.handleFailure(orderMessage, msg);
    }
  }

  private async processOrder(orderMessage: OrderMessage): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Idempotency check
      const existing = await queryRunner.manager.findOne(ProcessedMessageEntity, {
        where: { messageId: orderMessage.messageId },
      });

      if (existing) {
        this.logger.warn(`⚠️  Already processed: ${orderMessage.messageId}`);
        await queryRunner.commitTransaction();
        return;
      }

      // 2. Mark as processing
      const processedMessage = queryRunner.manager.create(ProcessedMessageEntity, {
        messageId: orderMessage.messageId,
        orderId: orderMessage.orderId,
        handler: 'OrdersWorker',
      });

      await queryRunner.manager.save(processedMessage);

      // 3. Find order
      const order = await queryRunner.manager.findOne(OrderEntity, {
        where: { id: orderMessage.orderId },
        relations: ['items'],
      });

      if (!order) {
        throw new Error(`Order ${orderMessage.orderId} not found`);
      }

      // 4. Lock products and validate stock
      const productIds = orderMessage.items.map((i) => i.productId);

      const products = await queryRunner.manager
        .createQueryBuilder(ProductEntity, 'p')
        .where('p.id IN (:...ids)', { ids: productIds })
        .setLock('pessimistic_write')
        .getMany();

      if (products.length !== productIds.length) {
        throw new Error('Some products not found');
      }

      // 5. Check stock
      for (const item of orderMessage.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.qty) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
      }

      // 6. Calculate total and update order items
      let total = 0;

      for (const item of orderMessage.items) {
        const product = products.find((p) => p.id === item.productId);
        total += product!.price * item.qty;

        // Update order item with price
        const orderItem = order.items.find((oi) => oi.productId === item.productId);
        if (orderItem) {
          orderItem.priceAtPurchase = product!.price;
          await queryRunner.manager.save(orderItem);
        }

        // Decrease stock
        product!.stock -= item.qty;
        await queryRunner.manager.save(product);
      }

      // 7. Update order
      order.status = 'PAID';
      order.totalPrice = total;
      order.processedAt = new Date();

      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      this.logger.log(`💾 Order ${order.id} updated to PAID, total: ${total}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === '23505'
      ) {
        // Unique violation
        this.logger.warn(`⚠️  Duplicate via constraint: ${orderMessage.messageId}`);
        return;
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private handleFailure(orderMessage: OrderMessage, msg: Message): void {
    const channel = this.rabbitMQService.getChannel();

    try {
      this.rabbitMQService.republishWithRetry(orderMessage);
      channel.ack(msg);

      this.logger.warn(`🔄 Republished: ${orderMessage.messageId}`);
    } catch (republishError) {
      const republishErrorMessage =
        republishError instanceof Error ? republishError.message : String(republishError);
      this.logger.error(`❌ Republish failed: ${republishErrorMessage}`);
      channel.nack(msg, false, false);
    }
  }
}

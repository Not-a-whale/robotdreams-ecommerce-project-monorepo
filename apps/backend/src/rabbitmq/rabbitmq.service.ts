import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import amqp, { Channel, ChannelModel } from 'amqplib';

export interface OrderMessage {
  messageId: string;
  orderId: string;
  userId: string;
  items: Array<{ productId: string; qty: number }>;
  createdAt: string;
  attempt: number;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: ChannelModel;
  private channel: Channel;

  private readonly ORDERS_QUEUE = 'orders.process';
  private readonly DLQ_QUEUE = 'orders.dlq';
  private readonly MAX_RETRIES = 3;

  async onModuleInit() {
    await this.connect();
    await this.setupTopology();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';

      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      this.logger.log('✅ Connected to RabbitMQ');

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });
    } catch (error) {
      const errorObject = error instanceof Error ? error : new Error(String(error));
      this.logger.error('❌ Failed to connect to RabbitMQ', errorObject.stack);
      throw errorObject;
    }
  }

  private async setupTopology() {
    try {
      await this.channel.assertQueue(this.ORDERS_QUEUE, { durable: true });
      await this.channel.assertQueue(this.DLQ_QUEUE, { durable: true });

      this.logger.log('✅ RabbitMQ topology ready');
    } catch (error) {
      const errorObject = error instanceof Error ? error : new Error(String(error));
      this.logger.error('❌ Failed to setup topology', errorObject.stack);
      throw errorObject;
    }
  }

  publishToOrdersQueue(message: OrderMessage): void {
    try {
      const sent = this.channel.sendToQueue(
        this.ORDERS_QUEUE,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          messageId: message.messageId,
          timestamp: Date.now(),
        },
      );

      if (!sent) {
        throw new Error('Failed to send message');
      }

      this.logger.log(`📤 Published ${message.messageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Publish failed: ${errorMessage}`);
      throw error;
    }
  }

  republishWithRetry(message: OrderMessage): void {
    const newAttempt = message.attempt + 1;

    if (newAttempt >= this.MAX_RETRIES) {
      this.publishToDLQ(message);
      this.logger.warn(`💀 ${message.messageId} → DLQ (max retries: ${this.MAX_RETRIES})`);
      return;
    }

    const updatedMessage = { ...message, attempt: newAttempt };

    this.channel.sendToQueue(this.ORDERS_QUEUE, Buffer.from(JSON.stringify(updatedMessage)), {
      persistent: true,
      messageId: message.messageId,
      timestamp: Date.now(),
    });

    this.logger.log(`🔄 Retry ${newAttempt}/${this.MAX_RETRIES}: ${message.messageId}`);
  }

  publishToDLQ(message: OrderMessage): void {
    try {
      this.channel.sendToQueue(this.DLQ_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
        messageId: message.messageId,
        timestamp: Date.now(),
      });

      this.logger.log(`💀 Published to DLQ: ${message.messageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ DLQ publish failed: ${errorMessage}`);
      throw error;
    }
  }

  getChannel(): Channel {
    return this.channel;
  }

  getOrdersQueue(): string {
    return this.ORDERS_QUEUE;
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('👋 Disconnected from RabbitMQ');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error disconnecting from RabbitMQ: ${errorMessage}`);
    }
  }
}

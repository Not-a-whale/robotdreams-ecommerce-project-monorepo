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
  private connection?: ChannelModel;
  private channel?: Channel;
  private isConnected = false;

  private readonly ORDERS_QUEUE = 'orders.process';
  private readonly DLQ_QUEUE = 'orders.dlq';
  private readonly MAX_RETRIES = 3;
  private readonly MAX_CONNECT_ATTEMPTS = 10;
  private readonly RETRY_DELAY_MS = 2000;

  async onModuleInit() {
    const connected = await this.connectWithRetry();

    if (!connected) {
      if (process.env.WORKER_MODE === 'true') {
        throw new Error(
          'RabbitMQ is required in worker mode, but connection could not be established',
        );
      }

      this.logger.warn('Running without RabbitMQ; async order processing is disabled');
      return;
    }

    await this.setupTopology();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connectWithRetry(): Promise<boolean> {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';

    for (let attempt = 1; attempt <= this.MAX_CONNECT_ATTEMPTS; attempt += 1) {
      try {
        this.connection = await amqp.connect(rabbitmqUrl);
        this.channel = await this.connection.createChannel();
        this.isConnected = true;

        this.logger.log('Connected to RabbitMQ');

        this.connection.on('error', (err) => {
          this.logger.error('RabbitMQ connection error', err);
        });

        this.connection.on('close', () => {
          this.isConnected = false;
          this.logger.warn('RabbitMQ connection closed');
        });

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const shouldRetry = attempt < this.MAX_CONNECT_ATTEMPTS;

        this.logger.warn(
          `RabbitMQ connect attempt ${attempt}/${this.MAX_CONNECT_ATTEMPTS} failed: ${errorMessage}`,
        );

        if (!shouldRetry) {
          return false;
        }

        await this.sleep(this.RETRY_DELAY_MS);
      }
    }

    return false;
  }

  private async setupTopology() {
    const channel = this.requireChannel();

    try {
      await channel.assertQueue(this.ORDERS_QUEUE, { durable: true });
      await channel.assertQueue(this.DLQ_QUEUE, { durable: true });

      this.logger.log('RabbitMQ topology ready');
    } catch (error) {
      const errorObject = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to setup topology', errorObject.stack);
      throw errorObject;
    }
  }

  publishToOrdersQueue(message: OrderMessage): void {
    const channel = this.requireChannel();

    try {
      const sent = channel.sendToQueue(this.ORDERS_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
        messageId: message.messageId,
        timestamp: Date.now(),
      });

      if (!sent) {
        throw new Error('Failed to send message');
      }

      this.logger.log(`Published ${message.messageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Publish failed: ${errorMessage}`);
      throw error;
    }
  }

  republishWithRetry(message: OrderMessage): void {
    const channel = this.requireChannel();
    const newAttempt = message.attempt + 1;

    if (newAttempt >= this.MAX_RETRIES) {
      this.publishToDLQ(message);
      this.logger.warn(`${message.messageId} -> DLQ (max retries: ${this.MAX_RETRIES})`);
      return;
    }

    const updatedMessage = { ...message, attempt: newAttempt };

    channel.sendToQueue(this.ORDERS_QUEUE, Buffer.from(JSON.stringify(updatedMessage)), {
      persistent: true,
      messageId: message.messageId,
      timestamp: Date.now(),
    });

    this.logger.log(`Retry ${newAttempt}/${this.MAX_RETRIES}: ${message.messageId}`);
  }

  publishToDLQ(message: OrderMessage): void {
    const channel = this.requireChannel();

    try {
      channel.sendToQueue(this.DLQ_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
        messageId: message.messageId,
        timestamp: Date.now(),
      });

      this.logger.log(`Published to DLQ: ${message.messageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`DLQ publish failed: ${errorMessage}`);
      throw error;
    }
  }

  getChannel(): Channel {
    return this.requireChannel();
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
      this.isConnected = false;
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error disconnecting from RabbitMQ: ${errorMessage}`);
    }
  }

  private requireChannel(): Channel {
    if (!this.isConnected || !this.channel) {
      throw new Error('RabbitMQ channel is not available');
    }

    return this.channel;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');

  logger.log('🚀 Starting Worker...');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  await app.init();

  logger.log('✅ Worker running');

  process.on('SIGTERM', () => {
    void (async () => {
      try {
        logger.log('SIGTERM received');
        await app.close();
        process.exit(0);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Worker shutdown failed: ${errorMessage}`);
        process.exit(1);
      }
    })();
  });
}

void bootstrap();

import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

function resolveProtoPath(): string {
  if (process.env.PAYMENTS_PROTO_PATH) {
    return process.env.PAYMENTS_PROTO_PATH;
  }
  return join(
    __dirname,
    '..',
    '..',
    '..',
    'packages',
    'contracts',
    'proto',
    'payments.proto',
  );
}

async function bootstrap() {
  const protoPath = resolveProtoPath();
  const url = process.env.PAYMENTS_GRPC_BIND ?? '0.0.0.0:50051';

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'payments',
      protoPath,
      url,
    },
  });

  await app.listen();
  console.log(`Payments gRPC listening on ${url}`);
  console.log(`Proto: ${protoPath}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

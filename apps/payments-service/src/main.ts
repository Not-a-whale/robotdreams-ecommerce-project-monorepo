import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
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
  const grpcUrl = process.env.PAYMENTS_GRPC_BIND ?? '0.0.0.0:50051';
  const httpPort = Number(process.env.PAYMENTS_HTTP_PORT ?? 3003);

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'payments',
      protoPath,
      url: grpcUrl,
    },
  });

  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(httpPort);

  console.log(`Payments HTTP listening on port ${httpPort}`);
  console.log(`Payments gRPC listening on ${grpcUrl}`);
  console.log(`Proto: ${protoPath}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

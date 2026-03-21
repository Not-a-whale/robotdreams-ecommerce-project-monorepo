import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PaymentsGrpcClientService } from './payments-grpc.client';

export function defaultPaymentsProtoPath(): string {
  return join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'packages',
    'contracts',
    'proto',
    'payments.proto',
  );
}

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PAYMENTS_GRPC',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'payments',
            protoPath: config.get<string>('PAYMENTS_PROTO_PATH') || defaultPaymentsProtoPath(),
            url: config.get<string>('PAYMENTS_GRPC_URL', 'localhost:50051'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [PaymentsGrpcClientService],
  exports: [ClientsModule, PaymentsGrpcClientService],
})
export class PaymentsClientModule {}

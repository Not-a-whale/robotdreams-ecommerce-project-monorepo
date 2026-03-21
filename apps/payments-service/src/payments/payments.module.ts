import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsGrpcController } from './payments.grpc.controller';

@Module({
  controllers: [PaymentsGrpcController],
  providers: [PaymentsService],
})
export class PaymentsModule {}

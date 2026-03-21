import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AuthorizePayload,
  PaymentIdPayload,
  PaymentsService,
} from './payments.service';

@Controller()
export class PaymentsGrpcController {
  constructor(private readonly payments: PaymentsService) {}

  @GrpcMethod('Payments', 'Authorize')
  authorize(data: AuthorizePayload) {
    return this.payments.authorize(data);
  }

  @GrpcMethod('Payments', 'GetPaymentStatus')
  getPaymentStatus(data: PaymentIdPayload) {
    return this.payments.getPaymentStatus(data);
  }

  @GrpcMethod('Payments', 'Capture')
  capture(data: PaymentIdPayload) {
    return this.payments.capture(data);
  }

  @GrpcMethod('Payments', 'Refund')
  refund(data: PaymentIdPayload) {
    return this.payments.refund(data);
  }
}

import { Inject, Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import type { Observable } from 'rxjs';

export type AuthorizeGrpcResponse = {
  paymentId: string;
  status: number;
};

interface PaymentsGrpcService {
  authorize(data: Record<string, unknown>): Observable<AuthorizeGrpcResponse>;
}

@Injectable()
export class PaymentsGrpcClientService implements OnModuleInit {
  private payments!: PaymentsGrpcService;

  constructor(@Inject('PAYMENTS_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.payments = this.client.getService<PaymentsGrpcService>('Payments');
  }
  async authorize(params: {
    orderId: string;
    amount: number;
    currency: string;
    idempotencyKey?: string;
  }): Promise<AuthorizeGrpcResponse> {
    const raw = process.env.PAYMENTS_GRPC_TIMEOUT_MS ?? '5000';
    const ms = parseInt(raw, 10);
    if (!Number.isFinite(ms) || ms <= 0) {
      throw new Error('PAYMENTS_GRPC_TIMEOUT_MS must be a positive integer (milliseconds)');
    }

    const payload: Record<string, unknown> = {
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
    };
    if (params.idempotencyKey) {
      payload.idempotencyKey = params.idempotencyKey;
    }

    try {
      return await firstValueFrom(this.payments.authorize(payload).pipe(timeout(ms)));
    } catch (err) {
      if (err instanceof TimeoutError) {
        throw new ServiceUnavailableException(
          `Payments Authorize timed out after ${ms}ms (PAYMENTS_GRPC_TIMEOUT_MS)`,
        );
      }
      throw err;
    }
  }
}

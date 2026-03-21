import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { randomUUID } from 'node:crypto';

export enum PaymentStatus {
  UNSPECIFIED = 0,
  AUTHORIZED = 1,
  CAPTURED = 2,
  REFUNDED = 3,
  FAILED = 4,
}

export interface StoredPayment {
  orderId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
}

export interface AuthorizePayload {
  orderId: string;
  amount: number | string;
  currency: string;
  idempotencyKey?: string;
}

export interface PaymentIdPayload {
  paymentId: string;
}

@Injectable()
export class PaymentsService {
  private readonly byId = new Map<string, StoredPayment>();
  private readonly idempotencyIndex = new Map<string, string>();

  authorize(data: AuthorizePayload): { paymentId: string; status: PaymentStatus } {
    const key = data.idempotencyKey?.trim();
    if (key) {
      const existingId = this.idempotencyIndex.get(key);
      if (existingId) {
        const stored = this.byId.get(existingId);
        if (stored) {
          return { paymentId: existingId, status: stored.status };
        }
      }
    }

    const paymentId = randomUUID();
    const next: StoredPayment = {
      orderId: data.orderId,
      amount: String(data.amount),
      currency: data.currency,
      status: PaymentStatus.AUTHORIZED,
    };
    this.byId.set(paymentId, next);
    if (key) {
      this.idempotencyIndex.set(key, paymentId);
    }
    return { paymentId, status: next.status };
  }

  getPaymentStatus(data: PaymentIdPayload): {
    paymentId: string;
    status: PaymentStatus;
  } {
    const stored = this.byId.get(data.paymentId);
    if (!stored) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Payment not found: ${data.paymentId}`,
      });
    }
    return { paymentId: data.paymentId, status: stored.status };
  }

  capture(_data: PaymentIdPayload): never {
    throw new RpcException({
      code: status.UNIMPLEMENTED,
      message: 'Capture is not implemented',
    });
  }

  refund(_data: PaymentIdPayload): never {
    throw new RpcException({
      code: status.UNIMPLEMENTED,
      message: 'Refund is not implemented',
    });
  }
}

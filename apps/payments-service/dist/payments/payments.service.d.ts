export declare enum PaymentStatus {
    UNSPECIFIED = 0,
    AUTHORIZED = 1,
    CAPTURED = 2,
    REFUNDED = 3,
    FAILED = 4
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
export declare class PaymentsService {
    private readonly byId;
    private readonly idempotencyIndex;
    authorize(data: AuthorizePayload): {
        paymentId: string;
        status: PaymentStatus;
    };
    getPaymentStatus(data: PaymentIdPayload): {
        paymentId: string;
        status: PaymentStatus;
    };
    capture(_data: PaymentIdPayload): never;
    refund(_data: PaymentIdPayload): never;
}

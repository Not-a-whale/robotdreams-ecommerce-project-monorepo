import { AuthorizePayload, PaymentIdPayload, PaymentsService } from './payments.service';
export declare class PaymentsGrpcController {
    private readonly payments;
    constructor(payments: PaymentsService);
    authorize(data: AuthorizePayload): {
        paymentId: string;
        status: import("./payments.service").PaymentStatus;
    };
    getPaymentStatus(data: PaymentIdPayload): {
        paymentId: string;
        status: import("./payments.service").PaymentStatus;
    };
    capture(data: PaymentIdPayload): never;
    refund(data: PaymentIdPayload): never;
}

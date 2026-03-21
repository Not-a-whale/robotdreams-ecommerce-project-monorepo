"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = exports.PaymentStatus = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const grpc_js_1 = require("@grpc/grpc-js");
const node_crypto_1 = require("node:crypto");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus[PaymentStatus["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    PaymentStatus[PaymentStatus["AUTHORIZED"] = 1] = "AUTHORIZED";
    PaymentStatus[PaymentStatus["CAPTURED"] = 2] = "CAPTURED";
    PaymentStatus[PaymentStatus["REFUNDED"] = 3] = "REFUNDED";
    PaymentStatus[PaymentStatus["FAILED"] = 4] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let PaymentsService = class PaymentsService {
    byId = new Map();
    idempotencyIndex = new Map();
    authorize(data) {
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
        const paymentId = (0, node_crypto_1.randomUUID)();
        const next = {
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
    getPaymentStatus(data) {
        const stored = this.byId.get(data.paymentId);
        if (!stored) {
            throw new microservices_1.RpcException({
                code: grpc_js_1.status.NOT_FOUND,
                message: `Payment not found: ${data.paymentId}`,
            });
        }
        return { paymentId: data.paymentId, status: stored.status };
    }
    capture(_data) {
        throw new microservices_1.RpcException({
            code: grpc_js_1.status.UNIMPLEMENTED,
            message: 'Capture is not implemented',
        });
    }
    refund(_data) {
        throw new microservices_1.RpcException({
            code: grpc_js_1.status.UNIMPLEMENTED,
            message: 'Refund is not implemented',
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)()
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
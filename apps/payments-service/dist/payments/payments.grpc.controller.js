"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsGrpcController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const payments_service_1 = require("./payments.service");
let PaymentsGrpcController = class PaymentsGrpcController {
    payments;
    constructor(payments) {
        this.payments = payments;
    }
    authorize(data) {
        return this.payments.authorize(data);
    }
    getPaymentStatus(data) {
        return this.payments.getPaymentStatus(data);
    }
    capture(data) {
        return this.payments.capture(data);
    }
    refund(data) {
        return this.payments.refund(data);
    }
};
exports.PaymentsGrpcController = PaymentsGrpcController;
__decorate([
    (0, microservices_1.GrpcMethod)('Payments', 'Authorize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsGrpcController.prototype, "authorize", null);
__decorate([
    (0, microservices_1.GrpcMethod)('Payments', 'GetPaymentStatus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsGrpcController.prototype, "getPaymentStatus", null);
__decorate([
    (0, microservices_1.GrpcMethod)('Payments', 'Capture'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsGrpcController.prototype, "capture", null);
__decorate([
    (0, microservices_1.GrpcMethod)('Payments', 'Refund'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsGrpcController.prototype, "refund", null);
exports.PaymentsGrpcController = PaymentsGrpcController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsGrpcController);
//# sourceMappingURL=payments.grpc.controller.js.map
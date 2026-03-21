"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
function resolveProtoPath() {
    if (process.env.PAYMENTS_PROTO_PATH) {
        return process.env.PAYMENTS_PROTO_PATH;
    }
    return (0, node_path_1.join)(__dirname, '..', '..', '..', 'packages', 'contracts', 'proto', 'payments.proto');
}
async function bootstrap() {
    const protoPath = resolveProtoPath();
    const url = process.env.PAYMENTS_GRPC_BIND ?? '0.0.0.0:50051';
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.GRPC,
        options: {
            package: 'payments',
            protoPath,
            url,
        },
    });
    await app.listen();
    console.log(`Payments gRPC listening on ${url}`);
    console.log(`Proto: ${protoPath}`);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
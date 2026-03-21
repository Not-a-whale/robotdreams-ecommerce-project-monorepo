import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { DataSource } from 'typeorm';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { PaymentsGrpcClientService } from 'src/payments/payments-grpc.client';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                findOne: jest.fn(),
                save: jest.fn(),
                create: jest.fn(),
              },
            }),
            getRepository: jest.fn().mockReturnValue({
              find: jest.fn().mockResolvedValue([]),
              findOne: jest.fn(),
              save: jest.fn(),
              create: jest.fn(),
            }),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            publishToQueue: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PaymentsGrpcClientService,
          useValue: {
            authorize: jest.fn().mockResolvedValue({ paymentId: 'pay-test', status: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

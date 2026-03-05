import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { UserModule } from './user/user.module';
import { dataSourceOptions } from './data-source';
import { HealthController } from './health-check.controller';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule,
    OrdersModule,
    UserModule,
    RabbitMQModule,
    WorkerModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, AppResolver],
})
export class AppModule {}

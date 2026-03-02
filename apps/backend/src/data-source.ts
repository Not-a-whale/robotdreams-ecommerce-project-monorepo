import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { UserEntity } from './user/entities/user.entity';
import { OrderEntity } from './orders/order.entity';
import { OrderItemEntity } from './orders/order-item-entity';
import { ProductEntity } from './products/product.entity';

config();

const isTsRuntime = process.argv.some((arg) => arg.includes('ts-node'));

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres', // ← postgres
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ecommerce',
  entities: [UserEntity, OrderEntity, OrderItemEntity, ProductEntity],
  migrations: isTsRuntime ? ['src/migrations/*.ts'] : ['dist/migrations/*.js'],
  migrationsRun: false,
  synchronize: true,
  logging: true,
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;

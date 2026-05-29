import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { DeliveryDetails } from '../orders/entities/delivery-details.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5434),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'patio_sarduy',
  entities: [Product, DeliveryDetails, Order, OrderItem, User],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsTransactionMode: 'each',
});

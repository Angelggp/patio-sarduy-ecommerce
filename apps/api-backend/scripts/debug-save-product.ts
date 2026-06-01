import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Product } from '../src/products/entities/product.entity';
import { DeliveryDetails } from '../src/orders/entities/delivery-details.entity';
import { Order } from '../src/orders/entities/order.entity';
import { OrderItem } from '../src/orders/entities/order-item.entity';
import { User } from '../src/users/entities/user.entity';

(async () => {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'patio_sarduy',
    entities: [Product, DeliveryDetails, Order, OrderItem, User],
    logging: ['query', 'error'],
  });
  try {
    await ds.initialize();
    const queryRunner = ds.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const repo = queryRunner.manager.getRepository(Product);
    const p = repo.create({
      commonName: 'TEST',
      scientificName: 'Testus testus',
      genus: 'Testus',
      family: 'Testaceae',
      growthForm: 'TREE' as any,
      origin: 'origin',
      provenance: 'prov',
      collector: 'col',
      threatCategory: 'LC' as any,
      isEndemic: false,
      population: 1,
      registrationDate: new Date(),
      mainPopularUse: { popularUse: true, medicinal: false, aromatic: false, culinary: false },
    } as any);

    await repo.save(p);
    await queryRunner.rollbackTransaction();
    console.log('Saved and rolled back');
    await queryRunner.release();
    await ds.destroy();
  } catch (e) {
    console.error('Error in debug save:', e);
    process.exit(1);
  }
})();

import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class DeliveryDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  address: string;

  @Column({ type: 'varchar', length: 80 })
  zone: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  instructions?: string;

  @OneToOne(() => Order, (order) => order.deliveryDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  order: Order;
}

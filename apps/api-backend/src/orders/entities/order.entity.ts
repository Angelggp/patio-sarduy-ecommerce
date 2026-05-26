import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeliveryDetails } from './delivery-details.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../../users/entities/user.entity';

export enum ORDER_STATUS {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum ORDER_TYPE {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ORDER_STATUS })
  status: ORDER_STATUS;

  @Column({ type: 'enum', enum: ORDER_TYPE })
  type: ORDER_TYPE;

  @Column({ type: 'varchar', length: 100 })
  customerName: string;

  @Column({ type: 'varchar', length: 20 })
  customerPhone: string;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'int', nullable: true })
  userId?: number | null;

  @OneToOne(() => DeliveryDetails, (deliveryDetails) => deliveryDetails.order, {
    cascade: true,
    nullable: true,
  })
  deliveryDetails?: DeliveryDetails;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

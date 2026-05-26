import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from '../../orders/entities/order-item.entity';

export enum GrowthForm {
  TREE = 'TREE',
  SHRUB = 'SHRUB',
  HERB = 'HERB',
  CLIMBER = 'CLIMBER',
  SUCCULENT = 'SUCCULENT',
  PALM = 'PALM',
}

export enum ThreatCategory {
  LC = 'LC',
  NT = 'NT',
  VU = 'VU',
  EN = 'EN',
  CR = 'CR',
  EW = 'EW',
  EX = 'EX',
  DD = 'DD',
}

export class MainPopularUse {
  @Column({ type: 'boolean' })
  culinary: boolean;

  @Column({ type: 'boolean' })
  medicinal: boolean;

  @Column({ type: 'boolean' })
  aromatic: boolean;
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  commonName: string;

  @Column({ type: 'varchar', length: 100 })
  scientificName: string;

  @Column({ type: 'varchar', length: 100 })
  genus: string;

  @Column({ type: 'varchar', length: 100 })
  family: string;

  @Column({ type: 'enum', enum: GrowthForm })
  growthForm: GrowthForm;

  @Column({ type: 'varchar', length: 100 })
  origin: string;

  @Column({ type: 'varchar', length: 100 })
  provenance: string;

  @Column({ type: 'varchar', length: 100 })
  collector: string;

  @Column({ type: 'enum', enum: ThreatCategory })
  threatCategory: ThreatCategory;

  @Column({ type: 'boolean' })
  isEndemic: boolean;

  @Column({ type: 'decimal', nullable: true })
  price?: number;

  @Column({ type: 'integer' })
  population: number;

  @Column({ type: 'timestamp' })
  registrationDate: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deathDate?: Date;

  @Column({ type: 'varchar', length: 180, nullable: true })
  imagePath?: string;

  @Column(() => MainPopularUse)
  mainPopularUse: MainPopularUse;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
}

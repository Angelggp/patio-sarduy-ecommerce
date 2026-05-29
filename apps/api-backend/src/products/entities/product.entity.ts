import {
  Column,
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
  @Column({ type: 'boolean', default: false })
  culinary: boolean;

  @Column({ type: 'boolean', default: false })
  medicinal: boolean;

  @Column({ type: 'boolean', default: false })
  aromatic: boolean;

  @Column({ type: 'boolean', default: false })
  popularUse: boolean;
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  plantNumber?: number;

  @Column({ type: 'varchar', length: 100 })
  commonName: string;

  @Column({ type: 'varchar', length: 255 })
  scientificName: string;

  @Column({ type: 'varchar', length: 100 })
  genus: string;

  @Column({ type: 'varchar', length: 100 })
  family: string;

  @Column({ type: 'enum', enum: GrowthForm, nullable: true })
  growthForm?: GrowthForm;

  @Column({ type: 'varchar', length: 100, nullable: true })
  origin?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provenance?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  collector?: string;

  @Column({ type: 'enum', enum: ThreatCategory, nullable: true })
  threatCategory?: ThreatCategory;

  @Column({ type: 'boolean', nullable: true })
  isEndemic?: boolean;

  @Column({ type: 'decimal', nullable: true })
  price?: number;

  @Column({ type: 'integer', nullable: true })
  population?: number;

  @Column({ type: 'timestamp', nullable: true })
  registrationDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deathDate?: Date;

  @Column({ type: 'varchar', length: 180, nullable: true })
  imagePath?: string;

  @Column(() => MainPopularUse)
  mainPopularUse: MainPopularUse;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
}

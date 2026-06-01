import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max para archivos CSV
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}

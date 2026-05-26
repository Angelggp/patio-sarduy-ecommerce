import { Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findMany(filters: QueryProductsDto): Promise<PaginatedResponseDto<Product>> {
    const normalizedPage = Number.isInteger(filters.page) && Number(filters.page) > 0
      ? Number(filters.page)
      : 1;
    const normalizedPageSize = Number.isInteger(filters.pageSize) && Number(filters.pageSize) > 0
      ? Math.min(Number(filters.pageSize), 100)
      : 20;

    const [results, total] = await this.productsRepository.findMany({
      ...filters,
      page: normalizedPage,
      pageSize: normalizedPageSize,
    });

    return {
      results,
      meta: {
        page: normalizedPage,
        pageSize: normalizedPageSize,
        total,
        totalPage: Math.ceil(total / normalizedPageSize) || 1,
      },
    };
  }

  createOne(payload: CreateProductDto): Promise<Product> {
    return this.productsRepository.createOne(payload);
  }

  updateOne(id: number, payload: UpdateProductDto): Promise<Product> {
    return this.productsRepository.updateOne(id, payload);
  }

  deleteOne(id: number): Promise<void> {
    return this.productsRepository.deleteOne(id);
  }
}

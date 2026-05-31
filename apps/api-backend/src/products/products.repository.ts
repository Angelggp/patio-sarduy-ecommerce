import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly ormRepository: Repository<Product>,
  ) {}

  async findMany(filters: QueryProductsDto): Promise<[Product[], number]> {
    const page = Number.isInteger(filters.page) && Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number.isInteger(filters.pageSize) && Number(filters.pageSize) > 0
      ? Math.min(Number(filters.pageSize), 1000)
      : 20;

    const queryBuilder = this.ormRepository
      .createQueryBuilder('product')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('product.id', 'DESC');

    if (filters.q?.trim()) {
      const normalizedSearch = `%${filters.q.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(product.commonName) LIKE :search', { search: normalizedSearch })
            .orWhere('LOWER(product.scientificName) LIKE :search', { search: normalizedSearch })
            .orWhere('LOWER(product.genus) LIKE :search', { search: normalizedSearch })
            .orWhere('LOWER(product.family) LIKE :search', { search: normalizedSearch });
        }),
      );
    }

    if (filters.growthForm) {
      queryBuilder.andWhere('product.growthForm = :growthForm', {
        growthForm: filters.growthForm,
      });
    }

    if (filters.threatCategory) {
      queryBuilder.andWhere('product.threatCategory = :threatCategory', {
        threatCategory: filters.threatCategory,
      });
    }

    if (typeof filters.isEndemic === 'boolean') {
      queryBuilder.andWhere('product.isEndemic = :isEndemic', {
        isEndemic: filters.isEndemic,
      });
    }

    if (typeof filters.culinary === 'boolean') {
      queryBuilder.andWhere('product.mainPopularUseCulinary = :culinary', {
        culinary: filters.culinary,
      });
    }

    if (typeof filters.medicinal === 'boolean') {
      queryBuilder.andWhere('product.mainPopularUseMedicinal = :medicinal', {
        medicinal: filters.medicinal,
      });
    }

    if (typeof filters.aromatic === 'boolean') {
      queryBuilder.andWhere('product.mainPopularUseAromatic = :aromatic', {
        aromatic: filters.aromatic,
      });
    }

    if (typeof filters.populationMin === 'number') {
      queryBuilder.andWhere('product.population >= :populationMin', {
        populationMin: filters.populationMin,
      });
    }

    if (typeof filters.populationMax === 'number') {
      queryBuilder.andWhere('product.population <= :populationMax', {
        populationMax: filters.populationMax,
      });
    }

    if (typeof filters.priceMin === 'number') {
      queryBuilder.andWhere('product.price >= :priceMin', {
        priceMin: filters.priceMin,
      });
    }

    if (typeof filters.priceMax === 'number') {
      queryBuilder.andWhere('product.price <= :priceMax', {
        priceMax: filters.priceMax,
      });
    }

    return queryBuilder.getManyAndCount();
  }

  async findOneById(id: number): Promise<Product | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  async createOne(payload: CreateProductDto): Promise<Product> {
    const entity = this.ormRepository.create({
      ...payload,
      registrationDate: payload.registrationDate ? new Date(payload.registrationDate) : new Date(),
      deathDate: payload.deathDate ? new Date(payload.deathDate) : undefined,
    });

    return this.ormRepository.save(entity);
  }

  async updateOne(id: number, payload: UpdateProductDto): Promise<Product> {
    const existing = await this.ormRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Producto con id ${id} no existe.`);
    }

    const mergedMainPopularUse = payload.mainPopularUse
      ? {
        ...existing.mainPopularUse,
        ...payload.mainPopularUse,
      }
      : existing.mainPopularUse;

    const entity = this.ormRepository.create({
      ...existing,
      ...payload,
      mainPopularUse: mergedMainPopularUse,
      registrationDate: payload.registrationDate
        ? new Date(payload.registrationDate)
        : existing.registrationDate,
      deathDate: payload.deathDate ? new Date(payload.deathDate) : existing.deathDate,
    });

    await this.ormRepository.save(entity);

    const updated = await this.ormRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Producto con id ${id} no existe.`);
    }

    return updated;
  }

  async deleteOne(id: number): Promise<void> {
    const result = await this.ormRepository.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException(`Producto con id ${id} no existe.`);
    }
  }

  async importOne(data: Partial<Product>): Promise<Product> {
    const entity = this.ormRepository.create(data);
    return this.ormRepository.save(entity);
  }
}

import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GrowthForm, ThreatCategory } from './entities/product.entity';
import { Product } from './entities/product.entity';
import { ProductsRepository } from './products.repository';

export interface ImportCsvResult {
  inserted: number;
  errors: { commonName: string; message: string }[];
}

function cleanFamily(value: string): string {
  return value.replace(/\s*\(\d+\)\s*G:\d+/gi, '').trim();
}

function parseGrowthForm(value: string): GrowthForm | undefined {
  const v = value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (v === 'arbol' || v === 'arbol estipitado') return GrowthForm.TREE;
  if (v === 'arbustivo' || v === 'arbustiva') return GrowthForm.SHRUB;
  if (v === 'herbaceo' || v === 'herbacea') return GrowthForm.HERB;
  if (v === 'trepadora') return GrowthForm.CLIMBER;
  if (v === 'suculenta' || v === 'suculento') return GrowthForm.SUCCULENT;
  if (v === 'palma' || v === 'palmar') return GrowthForm.PALM;
  return undefined;
}

function parseThreatCategory(value: string): ThreatCategory | undefined {
  const v = value.trim().toUpperCase();
  return (Object.values(ThreatCategory) as string[]).includes(v) ? (v as ThreatCategory) : undefined;
}

function parseCsvDate(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parts = trimmed.split('/');
  if (parts.length !== 3) return undefined;
  const nums = parts.map((p) => parseInt(p.trim(), 10));
  if (nums.some(isNaN)) return undefined;
  let [a, b, c] = nums;
  if (c < 100) c += 2000;
  const [month, day] = a > 12 ? [b, a] : [a, b];
  const date = new Date(c, month - 1, day);
  if (date.getFullYear() !== c || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
  return date;
}

function parseBoolCell(value: string): boolean {
  return value.trim().toLowerCase() === 'x';
}

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findMany(filters: QueryProductsDto): Promise<PaginatedResponseDto<Product>> {
    const normalizedPage = Number.isInteger(filters.page) && Number(filters.page) > 0
      ? Number(filters.page)
      : 1;
    const normalizedPageSize = Number.isInteger(filters.pageSize) && Number(filters.pageSize) > 0
      ? Math.min(Number(filters.pageSize), 500)
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

  async importCsv(buffer: Buffer): Promise<ImportCsvResult> {
    const records: Record<string, string>[] = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: false,
      bom: true,
    });

    let inserted = 0;
    const errors: ImportCsvResult['errors'] = [];

    for (const row of records) {
      const commonName = (row['Nombre Vulgar'] ?? '').trim();
      if (!commonName) continue;

      try {
        const populationRaw = (row['Cantidad de individuos'] ?? '').trim();
        const plantNumberRaw = (row['No. Planta'] ?? '').trim();

        await this.productsRepository.importOne({
          plantNumber: plantNumberRaw ? parseInt(plantNumberRaw, 10) : undefined,
          commonName,
          scientificName: (row['Nombre Científico'] ?? '').trim(),
          genus: (row['Género'] ?? '').trim(),
          family: cleanFamily(row['Familia'] ?? ''),
          growthForm: parseGrowthForm(row['Porte'] ?? ''),
          origin: (row['Origen'] ?? '').trim() || undefined,
          provenance: (row['Procedencia '] ?? row['Procedencia'] ?? '').trim() || undefined,
          collector: (row['Colector'] ?? '').trim() || undefined,
          threatCategory: parseThreatCategory(row['Categoria de amenaza'] ?? ''),
          isEndemic: (row['Endemismo'] ?? '').trim() ? parseBoolCell(row['Endemismo']) : undefined,
          population: populationRaw ? parseInt(populationRaw, 10) : undefined,
          registrationDate: parseCsvDate(row['Fecha de alta'] ?? ''),
          deathDate: parseCsvDate(row['Fecha de Muerte'] ?? ''),
          mainPopularUse: {
            popularUse: parseBoolCell(row['Mayor uso popular'] ?? ''),
            medicinal: parseBoolCell(row['Medicinal'] ?? ''),
            aromatic: parseBoolCell(row['Aromática'] ?? ''),
            culinary: parseBoolCell(row['Alimento'] ?? ''),
          },
        });
        inserted++;
      } catch (err) {
        errors.push({
          commonName,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { inserted, errors };
  }
}

import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { GrowthForm, ThreatCategory } from '../entities/product.entity';

function transformBoolean({ value }: { value: unknown }): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  return undefined;
}

export class QueryProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(GrowthForm)
  growthForm?: GrowthForm;

  @IsOptional()
  @IsEnum(ThreatCategory)
  threatCategory?: ThreatCategory;

  @IsOptional()
  @Transform(transformBoolean)
  @IsBoolean()
  isEndemic?: boolean;

  @IsOptional()
  @Transform(transformBoolean)
  @IsBoolean()
  culinary?: boolean;

  @IsOptional()
  @Transform(transformBoolean)
  @IsBoolean()
  medicinal?: boolean;

  @IsOptional()
  @Transform(transformBoolean)
  @IsBoolean()
  aromatic?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  populationMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  populationMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;
}

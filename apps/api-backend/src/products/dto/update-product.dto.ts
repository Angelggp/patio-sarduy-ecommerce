import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { GrowthForm, ThreatCategory } from '../entities/product.entity';

function transformBoolean({ value }: { value: unknown }): unknown {
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  return value;
}

class MainPopularUseUpdateDto {
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
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  commonName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  scientificName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  genus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  family?: string;

  @IsOptional()
  @IsEnum(GrowthForm)
  growthForm?: GrowthForm;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  provenance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  collector?: string;

  @IsOptional()
  @IsEnum(ThreatCategory)
  threatCategory?: ThreatCategory;

  @IsOptional()
  @Transform(transformBoolean)
  @IsBoolean()
  isEndemic?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  population?: number;

  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  deathDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  imagePath?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MainPopularUseUpdateDto)
  mainPopularUse?: MainPopularUseUpdateDto;
}

import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
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

class MainPopularUseDto {
  @Transform(transformBoolean)
  @IsBoolean()
  culinary: boolean;

  @Transform(transformBoolean)
  @IsBoolean()
  medicinal: boolean;

  @Transform(transformBoolean)
  @IsBoolean()
  aromatic: boolean;
}

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  commonName: string;

  @IsString()
  @MaxLength(100)
  scientificName: string;

  @IsString()
  @MaxLength(100)
  genus: string;

  @IsString()
  @MaxLength(100)
  family: string;

  @IsEnum(GrowthForm)
  growthForm: GrowthForm;

  @IsString()
  @MaxLength(100)
  origin: string;

  @IsString()
  @MaxLength(100)
  provenance: string;

  @IsString()
  @MaxLength(100)
  collector: string;

  @IsEnum(ThreatCategory)
  threatCategory: ThreatCategory;

  @Transform(transformBoolean)
  @IsBoolean()
  isEndemic: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  population: number;

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

  @ValidateNested()
  @Type(() => MainPopularUseDto)
  mainPopularUse: MainPopularUseDto;
}

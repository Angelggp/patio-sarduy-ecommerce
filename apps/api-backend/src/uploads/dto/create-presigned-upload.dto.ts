import { Type } from 'class-transformer';
import { IsInt, IsMimeType, IsString, MaxLength, Min } from 'class-validator';

export class CreatePresignedUploadDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsMimeType()
  contentType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  size!: number;
}
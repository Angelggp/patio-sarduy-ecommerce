import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePresignedDownloadDto } from './dto/create-presigned-download.dto';
import { CreatePresignedUploadDto } from './dto/create-presigned-upload.dto';
import { PresignedDownloadResponseDto } from './dto/presigned-download-response.dto';
import { PresignedUploadResponseDto } from './dto/presigned-upload-response.dto';
import { UploadsRepository } from './uploads.repository';

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);
  private readonly bucket = process.env.MINIO_BUCKET ?? 'images';
  private readonly publicBaseUrl =
    process.env.MINIO_PUBLIC_BASE_URL ?? process.env.MINIO_ENDPOINT ?? 'http://localhost:9000';
  private readonly defaultExpiresInSeconds = Number(
    process.env.UPLOAD_PRESIGNED_URL_EXPIRES_SECONDS ?? 120,
  );
  private readonly maxFileSizeBytes = Number(
    process.env.UPLOAD_MAX_FILE_SIZE_BYTES ?? 5 * 1024 * 1024,
  );
  private readonly allowedContentTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

  constructor(private readonly uploadsRepository: UploadsRepository) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.uploadsRepository.ensureBucketExists(this.bucket);
    } catch (error) {
      this.logger.error(
        `No se pudo inicializar el bucket ${this.bucket}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'No se pudo inicializar el almacenamiento de archivos.',
      );
    }
  }

  async createPresignedUpload(
    dto: CreatePresignedUploadDto,
  ): Promise<PresignedUploadResponseDto> {
    this.validateUploadRequest(dto);

    const normalizedFilename = this.normalizeFilename(dto.filename);
    const objectKey = this.buildObjectKey(normalizedFilename);
    const uploadUrl = await this.uploadsRepository.createPresignedUploadUrl({
      bucket: this.bucket,
      objectKey,
      contentType: dto.contentType,
      expiresInSeconds: this.defaultExpiresInSeconds,
    });

    return {
      uploadUrl,
      objectKey,
      expiresInSeconds: this.defaultExpiresInSeconds,
      objectUrl: this.buildObjectUrl(objectKey),
    };
  }

  async createPresignedDownload(
    dto: CreatePresignedDownloadDto,
  ): Promise<PresignedDownloadResponseDto> {
    if (!dto.objectKey || typeof dto.objectKey !== 'string') {
      throw new BadRequestException('objectKey es requerido.');
    }

    const expiresInSeconds = dto.expiresInSeconds ?? this.defaultExpiresInSeconds;
    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds <= 0 || expiresInSeconds > 3600) {
      throw new BadRequestException('expiresInSeconds debe estar entre 1 y 3600.');
    }

    const downloadUrl = await this.uploadsRepository.createPresignedDownloadUrl({
      bucket: this.bucket,
      objectKey: dto.objectKey,
      expiresInSeconds,
    });

    return {
      downloadUrl,
      expiresInSeconds,
    };
  }

  private validateUploadRequest(dto: CreatePresignedUploadDto): void {
    if (!dto.filename || typeof dto.filename !== 'string') {
      throw new BadRequestException('filename es requerido.');
    }

    if (!dto.contentType || typeof dto.contentType !== 'string') {
      throw new BadRequestException('contentType es requerido.');
    }

    if (!this.allowedContentTypes.has(dto.contentType)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Permitidos: ${Array.from(this.allowedContentTypes).join(', ')}`,
      );
    }

    if (!Number.isInteger(dto.size) || dto.size <= 0) {
      throw new BadRequestException('size debe ser un entero mayor que 0.');
    }

    if (dto.size > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `Archivo demasiado grande. Maximo permitido: ${this.maxFileSizeBytes} bytes.`,
      );
    }
  }

  private buildObjectKey(filename: string): string {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `uploads/${year}/${month}/${randomUUID()}-${filename}`;
  }

  private normalizeFilename(filename: string): string {
    const trimmed = filename.trim().toLowerCase();
    const sanitized = trimmed.replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
    const normalized = sanitized.replace(/^[-.]+|[-.]+$/g, '');
    if (!normalized) {
      throw new BadRequestException('filename no es valido.');
    }
    return normalized;
  }

  private buildObjectUrl(objectKey: string): string {
    const baseUrl = this.publicBaseUrl.endsWith('/')
      ? this.publicBaseUrl.slice(0, -1)
      : this.publicBaseUrl;

    const normalizedBase = baseUrl.toLowerCase();
    const normalizedBucketSuffix = `/${this.bucket.toLowerCase()}`;
    const alreadyIncludesBucket = normalizedBase.endsWith(normalizedBucketSuffix);

    return alreadyIncludesBucket
      ? `${baseUrl}/${objectKey}`
      : `${baseUrl}/${this.bucket}/${objectKey}`;
  }
}
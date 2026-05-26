import { Body, Controller, Post } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { USER_ROLE } from '../users/entities/user.entity';
import { CreatePresignedDownloadDto } from './dto/create-presigned-download.dto';
import { CreatePresignedUploadDto } from './dto/create-presigned-upload.dto';
import { PresignedDownloadResponseDto } from './dto/presigned-download-response.dto';
import { PresignedUploadResponseDto } from './dto/presigned-upload-response.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  createPresignedUpload(
    @Body() dto: CreatePresignedUploadDto,
  ): Promise<PresignedUploadResponseDto> {
    return this.uploadsService.createPresignedUpload(dto);
  }

  @Post('presign-read')
  createPresignedDownload(
    @Body() dto: CreatePresignedDownloadDto,
  ): Promise<PresignedDownloadResponseDto> {
    return this.uploadsService.createPresignedDownload(dto);
  }
}
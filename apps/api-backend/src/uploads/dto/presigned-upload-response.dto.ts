export class PresignedUploadResponseDto {
  uploadUrl!: string;
  objectKey!: string;
  expiresInSeconds!: number;
  objectUrl!: string;
}
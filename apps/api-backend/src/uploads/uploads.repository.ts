import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsRepository {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.MINIO_REGION ?? 'us-east-1',
      endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
      },
    });
  }

  async ensureBucketExists(bucket: string): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
    }

    // Make uploaded files publicly readable so frontend can render objectUrl directly.
    try {
      await this.s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: bucket,
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'PublicReadGetObject',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucket}/*`],
              },
            ],
          }),
        }),
      );
    } catch {
      // Bucket policy may fail on some MinIO versions - bucket access can be configured via MinIO UI instead
    }
  }

  async createPresignedUploadUrl(params: {
    bucket: string;
    objectKey: string;
    contentType: string;
    expiresInSeconds: number;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.objectKey,
      ContentType: params.contentType,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: params.expiresInSeconds,
    });
  }

  async createPresignedDownloadUrl(params: {
    bucket: string;
    objectKey: string;
    expiresInSeconds: number;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.objectKey,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: params.expiresInSeconds,
    });
  }
}
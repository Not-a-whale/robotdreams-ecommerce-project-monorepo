import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client?: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly configured: boolean;

  constructor() {
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucket = bucket || '';

    if (!bucket || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'S3 is not configured (missing S3_BUCKET, AWS_ACCESS_KEY_ID, or AWS_SECRET_ACCESS_KEY). File uploads will be disabled.',
      );
      this.configured = false;
      return;
    }

    this.configured = true;
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    void this.verifyBucket();
  }

  private ensureConfigured(): void {
    if (!this.configured || !this.s3Client) {
      throw new Error('S3 is not configured. File uploads are disabled.');
    }
  }

  private async verifyBucket() {
    try {
      await this.s3Client!.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`✅ Connected to S3 bucket: ${this.bucket}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to connect to S3: ${message}`);
    }
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    this.ensureConfigured();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client!, command, { expiresIn });

    this.logger.log(`📤 Generated presigned upload URL for: ${key}`);
    return url;
  }

  async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    this.ensureConfigured();
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client!, command, { expiresIn });

    this.logger.log(`📥 Generated presigned download URL for: ${key}`);
    return url;
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    this.ensureConfigured();
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client!.send(command);
    this.logger.log(`🗑️  Deleted file: ${key}`);
  }
}

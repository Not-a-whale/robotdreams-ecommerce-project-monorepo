import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  FileRecordEntity,
  FileStatus,
  FileEntityType,
  FileVisibility,
} from './entities/file-record.entity';
import { S3Service } from './s3.service';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(FileRecordEntity)
    private readonly fileRepository: Repository<FileRecordEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly s3Service: S3Service,
  ) {}

  async createAvatarUpload(userId: string, contentType: string) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      throw new BadRequestException(`Content type ${contentType} not allowed`);
    }

    const ext = contentType.split('/')[1] || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const key = `users/${userId}/avatar/${filename}`;

    this.logger.log(`📁 Creating file record for user ${userId}: ${key}`);

    const fileRecord = this.fileRepository.create({
      ownerId: userId,
      entityType: FileEntityType.USER_AVATAR,
      entityId: userId,
      key,
      contentType,
      status: FileStatus.PENDING,
      visibility: FileVisibility.PUBLIC,
    });

    await this.fileRepository.save(fileRecord);

    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
      key,
      contentType,
      3600, // 1 час на загрузку
    );

    return {
      fileId: fileRecord.id,
      key,
      uploadUrl,
      contentType,
      expiresIn: 3600,
    };
  }

  async completeAvatarUpload(fileId: string, userId: string) {
    const fileRecord = await this.fileRepository.findOne({
      where: { id: fileId },
    });

    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    if (fileRecord.ownerId !== userId) {
      throw new ForbiddenException('You can only complete your own uploads');
    }

    if (fileRecord.status !== FileStatus.PENDING) {
      throw new BadRequestException(`File already ${fileRecord.status}`);
    }

    this.logger.log(`✅ Completing upload for file ${fileId}`);

    fileRecord.status = FileStatus.READY;
    await this.fileRepository.save(fileRecord);

    const avatarUrl = this.s3Service.getPublicUrl(fileRecord.key);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const oldAvatarFileId = user?.avatarFileId;

    await this.userRepository.update(userId, {
      avatarUrl,
      avatarFileId: fileId,
    });

    if (oldAvatarFileId && oldAvatarFileId !== fileId) {
      try {
        const oldFile = await this.fileRepository.findOne({
          where: { id: oldAvatarFileId },
        });
        if (oldFile) {
          await this.s3Service.deleteFile(oldFile.key);
          await this.fileRepository.delete(oldAvatarFileId);
          this.logger.log(`🗑️  Deleted old avatar: ${oldFile.key}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to delete old avatar: ${error.message}`);
      }
    }

    return {
      fileId: fileRecord.id,
      url: avatarUrl,
      key: fileRecord.key,
    };
  }

  async getFileUrl(fileId: string, userId: string) {
    const fileRecord = await this.fileRepository.findOne({
      where: { id: fileId },
    });

    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    if (fileRecord.visibility === FileVisibility.PRIVATE && fileRecord.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (fileRecord.visibility === FileVisibility.PUBLIC) {
      return {
        url: this.s3Service.getPublicUrl(fileRecord.key),
      };
    }

    const url = await this.s3Service.generatePresignedDownloadUrl(fileRecord.key, 3600);

    return { url };
  }
}

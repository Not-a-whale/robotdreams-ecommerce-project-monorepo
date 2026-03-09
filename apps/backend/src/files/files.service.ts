import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
import { UserService } from '../user/user.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(FileRecordEntity)
    private readonly fileRepository: Repository<FileRecordEntity>,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {}

  async createAvatarUpload(userId: string, contentType: string) {
    await this.userService.findById(userId);

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
      visibility: FileVisibility.PRIVATE,
    });

    await this.fileRepository.save(fileRecord);

    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(key, contentType, 3600);

    return {
      fileId: fileRecord.id,
      key,
      uploadUrl,
      contentType,
      expiresIn: 3600,
    };
  }

  async completeAvatarUpload(fileId: string, userId: string) {
    this.logger.log(`🔍 Complete avatar upload: fileId=${fileId}, userId=${userId}`);

    const fileRecord = await this.fileRepository.findOne({
      where: { id: fileId },
    });

    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    this.logger.log(`✅ Found file record: ${fileRecord.key}`);

    if (fileRecord.ownerId !== userId) {
      throw new ForbiddenException('You can only complete your own uploads');
    }

    if (fileRecord.status !== FileStatus.PENDING) {
      throw new BadRequestException(`File already ${fileRecord.status}`);
    }

    fileRecord.status = FileStatus.READY;
    await this.fileRepository.save(fileRecord);
    this.logger.log(`✅ File status updated to READY`);

    const avatarUrl = this.s3Service.getPublicUrl(fileRecord.key);
    const signedAvatarUrl = await this.s3Service.generatePresignedDownloadUrl(fileRecord.key, 3600);
    this.logger.log(`🔗 Avatar URL: ${avatarUrl}`);

    await this.userService.updateAvatar(userId, {
      avatarUrl,
      avatarFileId: fileId,
    });

    this.logger.log(`✅ User avatar updated via UserService`);

    return {
      fileId: fileRecord.id,
      url: signedAvatarUrl,
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

    const url = await this.s3Service.generatePresignedDownloadUrl(fileRecord.key, 3600);

    return { url };
  }
}

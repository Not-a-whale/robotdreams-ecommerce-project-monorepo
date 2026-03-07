import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-avatar')
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(
    @Body() dto: UploadAvatarDto,
    @Body('userId') userId: string, // TODO: Получать из JWT токена через @CurrentUser()
  ) {
    return this.filesService.createAvatarUpload(userId, dto.contentType);
  }

  @Post('complete-avatar')
  @HttpCode(HttpStatus.OK)
  async completeAvatar(
    @Body() dto: CompleteUploadDto,
    @Body('userId') userId: string, // TODO: Получать из JWT токена
  ) {
    return this.filesService.completeAvatarUpload(dto.fileId, userId);
  }

  @Get(':fileId/url')
  async getFileUrl(
    @Param('fileId') fileId: string,
    @Body('userId') userId: string, // TODO: Получать из JWT токена
  ) {
    return this.filesService.getFileUrl(fileId, userId);
  }
}

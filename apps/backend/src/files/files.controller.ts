import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-avatar')
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(@Body() dto: UploadAvatarDto) {
    return this.filesService.createAvatarUpload(String(dto.userId), String(dto.contentType));
  }

  @Post('complete-avatar')
  @HttpCode(HttpStatus.OK)
  async completeAvatar(@Body() dto: CompleteUploadDto) {
    return this.filesService.completeAvatarUpload(String(dto.fileId), String(dto.userId));
  }

  @Get(':fileId/url')
  getFileUrl(@Param('fileId') fileId: string, @Query('userId') userId: string) {
    return this.filesService.getFileUrl(fileId, userId);
  }
}

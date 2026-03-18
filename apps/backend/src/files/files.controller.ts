import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-avatar')
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(@Body() dto: UploadAvatarDto, @CurrentUser() user: AuthUser) {
    return this.filesService.createAvatarUpload(user.id, dto.contentType);
  }

  @Post('complete-avatar')
  @HttpCode(HttpStatus.OK)
  async completeAvatar(@Body() dto: CompleteUploadDto, @CurrentUser() user: AuthUser) {
    return this.filesService.completeAvatarUpload(String(dto.fileId), user.id);
  }

  @Get(':fileId/url')
  getFileUrl(@Param('fileId') fileId: string, @Query('userId') userId: string) {
    return this.filesService.getFileUrl(fileId, userId);
  }
}

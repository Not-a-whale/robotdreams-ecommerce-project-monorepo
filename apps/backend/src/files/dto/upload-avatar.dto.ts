import { IsString, IsIn, IsUUID } from 'class-validator';

export class UploadAvatarDto {
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'])
  contentType: string;

  @IsUUID()
  userId: string;
}

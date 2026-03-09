import { IsUUID } from 'class-validator';

export class CompleteUploadDto {
  @IsUUID()
  fileId: string;

  @IsUUID()
  userId: string;
}

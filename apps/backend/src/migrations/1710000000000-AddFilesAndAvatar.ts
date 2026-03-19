import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilesAndAvatar1710000000000 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    // no-op: file_records and avatar columns are managed by synchronize + later migrations
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op
  }
}

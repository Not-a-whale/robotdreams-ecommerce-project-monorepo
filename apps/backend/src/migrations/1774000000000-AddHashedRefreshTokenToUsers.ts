import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHashedRefreshTokenToUsers1774000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "hashed_refresh_token" TEXT
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN IF EXISTS "hashed_refresh_token"
        `);
  }
}

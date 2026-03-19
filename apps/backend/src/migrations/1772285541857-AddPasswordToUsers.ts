import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordToUsers1772285541857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "password" VARCHAR(255)
        `);

    await queryRunner.query(`
            DELETE FROM "users" 
            WHERE "password" IS NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "password" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "password"
        `);
  }
}

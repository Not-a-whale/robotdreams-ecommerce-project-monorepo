import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToUsers1773000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "name" VARCHAR(255) NOT NULL DEFAULT 'User'
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "name" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "name"
    `);
  }
}

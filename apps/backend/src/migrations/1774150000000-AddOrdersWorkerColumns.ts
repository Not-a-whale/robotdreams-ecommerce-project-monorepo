import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdersWorkerColumns1774150000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "message_id" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "processed_at" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "processed_at"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "message_id"`);
  }
}

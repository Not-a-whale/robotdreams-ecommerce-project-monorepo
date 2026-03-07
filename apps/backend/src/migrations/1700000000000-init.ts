import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdersUserCreatedAtIndex1700000000000 implements MigrationInterface {
  name = 'AddOrdersUserCreatedAtIndex1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "orders" (...)`);
    await queryRunner.query(`CREATE INDEX "idx_orders_created_at" ON "orders"("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_orders_created_at";
    `);
  }
}

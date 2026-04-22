import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductsSortIndexes1774400000000 implements MigrationInterface {
  name = 'ProductsSortIndexes1774400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_products_created_id"
      ON "products" ("created_at" DESC, "id" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_products_price_id"
      ON "products" ("price" DESC, "id" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_price_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_created_id"`);
  }
}
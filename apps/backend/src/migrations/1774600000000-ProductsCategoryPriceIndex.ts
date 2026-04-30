import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductsCategoryPriceIndex1774600000000 implements MigrationInterface {
  name = 'ProductsCategoryPriceIndex1774600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_products_category_price_id"
      ON "products" ("category_slug", "price" DESC, "id" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_category_price_id"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductsCategoryCreatedIdIndex1774300000000 implements MigrationInterface {
  name = 'ProductsCategoryCreatedIdIndex1774300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_products_category_created_id"
      ON "products" ("category_slug", "created_at" DESC, "id" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_category_created_id"`);
  }
}

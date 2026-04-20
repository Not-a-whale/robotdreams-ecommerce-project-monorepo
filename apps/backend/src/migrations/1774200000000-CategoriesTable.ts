import { MigrationInterface, QueryRunner } from 'typeorm';

const SLUGS = [
  't-shirts',
  'shoes',
  'accessories',
  'bags',
  'dresses',
  'jackets',
  'gloves',
];

export class CategoriesTable1774200000000 implements MigrationInterface {
  name = 'CategoriesTable1774200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "slug" character varying(64) NOT NULL,
        "name" character varying(128) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_categories" PRIMARY KEY ("slug")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "categories" ("slug", "name", "sort_order") VALUES
        ('t-shirts', 'T-shirts', 1),
        ('shoes', 'Shoes', 2),
        ('accessories', 'Accessories', 3),
        ('bags', 'Bags', 4),
        ('dresses', 'Dresses', 5),
        ('jackets', 'Jackets', 6),
        ('gloves', 'Gloves', 7)
      ON CONFLICT ("slug") DO NOTHING
    `);

    await queryRunner.query(`
      UPDATE "products" SET "category_slug" = 't-shirts' WHERE "category_slug" = 'mens-running'
    `);
    await queryRunner.query(`
      UPDATE "products" SET "category_slug" = 'jackets' WHERE "category_slug" = 'mens-clothing'
    `);
    await queryRunner.query(`
      UPDATE "products" SET "category_slug" = 'shoes' WHERE "category_slug" = 'mens-shoes'
    `);

    await queryRunner.query(`
      UPDATE "products" SET "category_slug" = 'accessories'
      WHERE "category_slug" IS NULL OR "category_slug" = ''
    `);

    await queryRunner.query(`
      DELETE FROM "products"
      WHERE "category_slug" NOT IN (${SLUGS.map((s) => `'${s}'`).join(', ')})
    `);

    await queryRunner.query(`
      ALTER TABLE "products" ALTER COLUMN "category_slug" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_category_slug"
      FOREIGN KEY ("category_slug") REFERENCES "categories"("slug")
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_category_slug"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "category_slug" DROP NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
  }
}

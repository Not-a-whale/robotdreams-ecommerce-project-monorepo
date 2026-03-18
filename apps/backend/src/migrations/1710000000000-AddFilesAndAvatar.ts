import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilesAndAvatar1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "file_records" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "owner_id" UUID NOT NULL,
        "entity_type" VARCHAR NOT NULL,
        "entity_id" VARCHAR,
        "key" VARCHAR UNIQUE NOT NULL,
        "content_type" VARCHAR NOT NULL,
        "size" INT DEFAULT 0,
        "status" VARCHAR DEFAULT 'PENDING',
        "visibility" VARCHAR DEFAULT 'PUBLIC',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "avatar_url" VARCHAR,
      ADD COLUMN "avatar_file_id" UUID,
      ADD CONSTRAINT "fk_users_avatar_file" 
        FOREIGN KEY ("avatar_file_id") 
        REFERENCES "file_records"("id") 
        ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_file_records_owner" ON "file_records"("owner_id");
      CREATE INDEX "idx_file_records_entity" ON "file_records"("entity_type", "entity_id");
      CREATE INDEX "idx_file_records_status" ON "file_records"("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT "fk_users_avatar_file",
      DROP COLUMN "avatar_url",
      DROP COLUMN "avatar_file_id"
    `);

    await queryRunner.query(`DROP TABLE "file_records"`);
  }
}

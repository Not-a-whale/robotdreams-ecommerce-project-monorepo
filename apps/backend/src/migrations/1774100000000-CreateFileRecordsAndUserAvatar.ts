import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileRecordsAndUserAvatar1774100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "file_records_status_enum" AS ENUM ('PENDING', 'READY', 'FAILED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "file_records_visibility_enum" AS ENUM ('PRIVATE', 'PUBLIC');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
    await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "file_records_entity_type_enum" AS ENUM ('USER_AVATAR', 'PRODUCT_IMAGE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "file_records" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "owner_id" uuid NOT NULL,
                "entity_type" "file_records_entity_type_enum" NOT NULL,
                "entity_id" character varying,
                "key" character varying NOT NULL,
                "content_type" character varying NOT NULL,
                "size" integer NOT NULL DEFAULT 0,
                "status" "file_records_status_enum" NOT NULL DEFAULT 'PENDING',
                "visibility" "file_records_visibility_enum" NOT NULL DEFAULT 'PUBLIC',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_file_records_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_file_records_key" UNIQUE ("key")
            )
        `);

    await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "file_records"
                ADD CONSTRAINT "FK_file_records_owner_id"
                FOREIGN KEY ("owner_id") REFERENCES "users"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

    await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_file_id" uuid
        `);

    await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "users"
                ADD CONSTRAINT "FK_users_avatar_file_id"
                FOREIGN KEY ("avatar_file_id") REFERENCES "file_records"("id")
                ON DELETE SET NULL ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "users" DROP CONSTRAINT "FK_users_avatar_file_id";
            EXCEPTION
                WHEN undefined_object THEN null;
            END $$;
        `);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_file_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_url"`);
    await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "file_records" DROP CONSTRAINT "FK_file_records_owner_id";
            EXCEPTION
                WHEN undefined_object THEN null;
            END $$;
        `);
    await queryRunner.query(`DROP TABLE IF EXISTS "file_records"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "file_records_entity_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "file_records_visibility_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "file_records_status_enum"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRabbitMQFields1709500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add fields to orders
    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD COLUMN "message_id" VARCHAR,
      ADD COLUMN "processed_at" TIMESTAMP,
      ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Create processed_messages table
    await queryRunner.query(`
      CREATE TABLE "processed_messages" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "message_id" VARCHAR UNIQUE NOT NULL,
        "order_id" VARCHAR NOT NULL,
        "handler" VARCHAR,
        "processed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_PROCESSED_MESSAGES_MESSAGE_ID" 
      ON "processed_messages" ("message_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "processed_messages"`);
    await queryRunner.query(`
      ALTER TABLE "orders" 
      DROP COLUMN "message_id",
      DROP COLUMN "processed_at",
      DROP COLUMN "updated_at"
    `);
  }
}

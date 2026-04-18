import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcessedMessagesTable1774050000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "processed_messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "message_id" character varying NOT NULL,
                "order_id" character varying NOT NULL,
                "handler" character varying,
                "processed_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_processed_messages_message_id" UNIQUE ("message_id"),
                CONSTRAINT "PK_processed_messages_id" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "processed_messages"`);
  }
}

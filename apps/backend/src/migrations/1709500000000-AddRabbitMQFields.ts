import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRabbitMQFields1709500000000 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    // no-op: schema is managed by synchronize + later migrations
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op
  }
}

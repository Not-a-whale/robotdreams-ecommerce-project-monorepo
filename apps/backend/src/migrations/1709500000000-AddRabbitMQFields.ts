import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRabbitMQFields1709500000000 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdersUserCreatedAtIndex1700000000000 implements MigrationInterface {
  name = 'AddOrdersUserCreatedAtIndex1700000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // no-op: schema is created by later auto-generated migrations
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordToUsers1772285541857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Удаляем всех пользователей без пароля (старых)
    await queryRunner.query(`
            DELETE FROM "users" 
            WHERE "password" IS NULL
        `);

    // Добавляем колонку password как NOT NULL
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "password" VARCHAR(255) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Откатываем - удаляем колонку password
    await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "password"
        `);
  }
}

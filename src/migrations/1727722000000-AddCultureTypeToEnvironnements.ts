import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCultureTypeToEnvironnements1727722000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE environnements
            ADD COLUMN IF NOT EXISTS culture_type VARCHAR(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE environnements
            DROP COLUMN IF EXISTS culture_type
        `);
    }
}

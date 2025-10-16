import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSemiToEtapeCultureEnum1729300000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lots\`
            MODIFY COLUMN \`etapeCulture\` ENUM('Semi', 'Croissance', 'Floraison', 'Sechage', 'Maturation', 'Stockage') NOT NULL DEFAULT 'Semi'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lots\`
            MODIFY COLUMN \`etapeCulture\` ENUM('Croissance', 'Floraison', 'Sechage', 'Maturation', 'Stockage') NOT NULL DEFAULT 'Croissance'
        `);
    }
}

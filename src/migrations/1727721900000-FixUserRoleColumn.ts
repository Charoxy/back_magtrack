import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserRoleColumn1727721900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Modifier la colonne role pour ajouter non_producteur
        await queryRunner.query(`
            ALTER TABLE users
            MODIFY COLUMN role ENUM('producteur', 'non_producteur', 'admin', 'technicien') DEFAULT 'producteur'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            MODIFY COLUMN role ENUM('producteur', 'admin', 'technicien') DEFAULT 'producteur'
        `);
    }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStockMovementsFields1727721600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter les nouveaux champs à stock_movements
        await queryRunner.query(`
            ALTER TABLE stock_movements
            ADD COLUMN IF NOT EXISTS lot_type VARCHAR(20) NULL,
            ADD COLUMN IF NOT EXISTS lot_nom VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS transformation_id INT NULL,
            ADD COLUMN IF NOT EXISTS transformation_nom VARCHAR(255) NULL
        `);

        // Modifier lotId pour le rendre nullable
        await queryRunner.query(`
            ALTER TABLE stock_movements
            MODIFY COLUMN lotId INT NULL
        `);

        // Ajouter les nouveaux types au movementType enum
        await queryRunner.query(`
            ALTER TABLE stock_movements
            MODIFY COLUMN movementType ENUM('entree', 'sortie', 'sale', 'loss', 'adjustment', 'transformation') DEFAULT 'adjustment'
        `);

        // Nettoyer les transformation_id invalides
        await queryRunner.query(`
            UPDATE stock_movements
            SET transformation_id = NULL
            WHERE transformation_id IS NOT NULL
            AND transformation_id NOT IN (SELECT id FROM lots_transformation)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE stock_movements DROP COLUMN IF EXISTS transformation_nom`);
        await queryRunner.query(`ALTER TABLE stock_movements DROP COLUMN IF EXISTS transformation_id`);
        await queryRunner.query(`ALTER TABLE stock_movements DROP COLUMN IF EXISTS lot_nom`);
        await queryRunner.query(`ALTER TABLE stock_movements DROP COLUMN IF EXISTS lot_type`);
        await queryRunner.query(`ALTER TABLE stock_movements MODIFY COLUMN lotId INT NOT NULL`);
    }
}

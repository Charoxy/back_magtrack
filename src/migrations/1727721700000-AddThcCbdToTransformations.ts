import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThcCbdToTransformations1727721700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter les colonnes tauxTHC et tauxCBD
        await queryRunner.query(`
            ALTER TABLE lots_transformation
            ADD COLUMN IF NOT EXISTS tauxTHC DECIMAL(5,2) NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS tauxCBD DECIMAL(5,2) NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE lots_transformation DROP COLUMN IF EXISTS tauxCBD`);
        await queryRunner.query(`ALTER TABLE lots_transformation DROP COLUMN IF EXISTS tauxTHC`);
    }
}

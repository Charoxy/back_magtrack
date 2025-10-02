import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocalisationToEnvironnements1727722100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter toutes les colonnes manquantes à la table environnements
        await queryRunner.query(`
            ALTER TABLE environnements
            ADD COLUMN IF NOT EXISTS localisation VARCHAR(255) NULL,
            ADD COLUMN IF NOT EXISTS surface_m2 DECIMAL(6,2) NULL,
            ADD COLUMN IF NOT EXISTS capacite_max_plants INT NULL,
            ADD COLUMN IF NOT EXISTS temp_cible_min DECIMAL(4,1) NULL,
            ADD COLUMN IF NOT EXISTS temp_cible_max DECIMAL(4,1) NULL,
            ADD COLUMN IF NOT EXISTS humidite_cible_min DECIMAL(4,1) NULL,
            ADD COLUMN IF NOT EXISTS humidite_cible_max DECIMAL(4,1) NULL,
            ADD COLUMN IF NOT EXISTS co2_cible_ppm INT NULL,
            ADD COLUMN IF NOT EXISTS lumiere_watt INT NULL,
            ADD COLUMN IF NOT EXISTS nombre_ventilateurs TINYINT NULL,
            ADD COLUMN IF NOT EXISTS photoperiode_jour TINYINT NULL,
            ADD COLUMN IF NOT EXISTS photoperiode_nuit TINYINT NULL,
            ADD COLUMN IF NOT EXISTS alertes_activees BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS statut ENUM('actif', 'en maintenance', 'fermé') DEFAULT 'actif',
            ADD COLUMN IF NOT EXISTS commentaires TEXT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE environnements
            DROP COLUMN IF EXISTS localisation,
            DROP COLUMN IF EXISTS surface_m2,
            DROP COLUMN IF EXISTS capacite_max_plants,
            DROP COLUMN IF EXISTS temp_cible_min,
            DROP COLUMN IF EXISTS temp_cible_max,
            DROP COLUMN IF EXISTS humidite_cible_min,
            DROP COLUMN IF EXISTS humidite_cible_max,
            DROP COLUMN IF EXISTS co2_cible_ppm,
            DROP COLUMN IF EXISTS lumiere_watt,
            DROP COLUMN IF EXISTS nombre_ventilateurs,
            DROP COLUMN IF EXISTS photoperiode_jour,
            DROP COLUMN IF EXISTS photoperiode_nuit,
            DROP COLUMN IF EXISTS alertes_activees,
            DROP COLUMN IF EXISTS statut,
            DROP COLUMN IF EXISTS commentaires
        `);
    }
}

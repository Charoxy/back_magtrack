import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocalisationToEnvironnements1727722100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Vérifier et ajouter chaque colonne individuellement
        const columns = [
            { name: 'localisation', type: 'VARCHAR(255) NULL' },
            { name: 'surface_m2', type: 'DECIMAL(6,2) NULL' },
            { name: 'capacite_max_plants', type: 'INT NULL' },
            { name: 'temp_cible_min', type: 'DECIMAL(4,1) NULL' },
            { name: 'temp_cible_max', type: 'DECIMAL(4,1) NULL' },
            { name: 'humidite_cible_min', type: 'DECIMAL(4,1) NULL' },
            { name: 'humidite_cible_max', type: 'DECIMAL(4,1) NULL' },
            { name: 'co2_cible_ppm', type: 'INT NULL' },
            { name: 'lumiere_watt', type: 'INT NULL' },
            { name: 'nombre_ventilateurs', type: 'TINYINT NULL' },
            { name: 'photoperiode_jour', type: 'TINYINT NULL' },
            { name: 'photoperiode_nuit', type: 'TINYINT NULL' },
            { name: 'alertes_activees', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'statut', type: "ENUM('actif', 'en maintenance', 'fermé') DEFAULT 'actif'" },
            { name: 'commentaires', type: 'TEXT NULL' }
        ];

        for (const col of columns) {
            await queryRunner.query(`
                ALTER TABLE environnements
                ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
            `);
        }
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

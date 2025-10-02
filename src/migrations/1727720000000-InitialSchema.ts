import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1727720000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {

        // 1. Table users
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                nom VARCHAR(255) NOT NULL,
                organisation VARCHAR(255) NULL,
                role ENUM('producteur', 'non_producteur', 'admin', 'technicien') DEFAULT 'producteur',
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX idx_users_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 2. Table varietes
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS varietes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                description TEXT NULL,
                origine VARCHAR(255) NULL,
                breeder VARCHAR(255) NULL,
                type VARCHAR(255) NULL,
                tauxTHC FLOAT NULL,
                tauxCBD FLOAT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 3. Table environnements
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS environnements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                type ENUM('culture', 'séchage', 'stockage', 'destruction', 'autre') NOT NULL,
                culture_type ENUM('indoor', 'outdoor') NULL,
                localisation VARCHAR(255) NULL,
                surface_m2 DECIMAL(6,2) NULL,
                capacite_max_plants INT NULL,
                temp_cible_min DECIMAL(4,1) NULL,
                temp_cible_max DECIMAL(4,1) NULL,
                humidite_cible_min DECIMAL(4,1) NULL,
                humidite_cible_max DECIMAL(4,1) NULL,
                co2_cible_ppm INT NULL,
                lumiere_watt INT NULL,
                nombre_ventilateurs TINYINT NULL,
                photoperiode_jour TINYINT NULL,
                photoperiode_nuit TINYINT NULL,
                alertes_activees BOOLEAN DEFAULT FALSE,
                statut ENUM('actif', 'en maintenance', 'fermé') DEFAULT 'actif',
                commentaires TEXT NULL,
                userId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_environnements_userId (userId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 4. Table lots
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS lots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                description TEXT NULL,
                dateDebut DATE NOT NULL,
                dateFin DATE NULL,
                planteQuantite INT NOT NULL,
                etapeCulture ENUM('Croissance', 'Floraison', 'Sechage', 'Maturation', 'Stockage') DEFAULT 'Croissance',
                quantite DECIMAL(10,2) NULL,
                stock DECIMAL(10,2) NULL DEFAULT 0,
                productType VARCHAR(50) DEFAULT 'flower',
                userId INT NOT NULL,
                varieteId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (varieteId) REFERENCES varietes(id) ON DELETE CASCADE,
                INDEX idx_lots_userId (userId),
                INDEX idx_lots_varieteId (varieteId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 5. Table environnements_lots
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS environnements_lots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lotId INT NOT NULL,
                environnementId INT NOT NULL,
                etape ENUM('culture', 'séchage', 'maturation', 'autre') NOT NULL,
                date_entree DATE NOT NULL,
                date_sortie DATE NULL,
                commentaire TEXT NULL,
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE,
                FOREIGN KEY (environnementId) REFERENCES environnements(id) ON DELETE CASCADE,
                INDEX idx_env_lots_lotId (lotId),
                INDEX idx_env_lots_envId (environnementId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 6. Table conditions_environnementales
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS conditions_environnementales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                environnementId INT NOT NULL,
                date_heure DATETIME NOT NULL,
                temperature DECIMAL(4,1) NULL,
                humidite DECIMAL(4,1) NULL,
                co2 INT NULL,
                lumiere INT NULL,
                source ENUM('manuel', 'capteur') DEFAULT 'manuel',
                commentaire TEXT NULL,
                FOREIGN KEY (environnementId) REFERENCES environnements(id) ON DELETE CASCADE,
                INDEX idx_cond_env_envId (environnementId),
                INDEX idx_cond_env_date (date_heure)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 7. Table nutriments
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS nutriments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                marque VARCHAR(255) NOT NULL,
                type ENUM('minerale', 'organique', 'chimique') DEFAULT 'organique',
                description TEXT NULL,
                isPublic BOOLEAN NOT NULL DEFAULT FALSE,
                INDEX idx_nutriments_marque (marque),
                INDEX idx_nutriments_type (type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 8. Table lot_action
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS lot_action (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(255) NOT NULL,
                description VARCHAR(255) NULL,
                stage ENUM('semi', 'croissance', 'floraison', 'maturation', 'sechage') NULL,
                quantity FLOAT NULL,
                unit VARCHAR(255) NULL,
                date DATE NOT NULL,
                OldEnv INT NULL,
                NewEnv INT NULL,
                lotId INT NOT NULL,
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE,
                INDEX idx_lot_action_lotId (lotId),
                INDEX idx_lot_action_date (date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 9. Table nutriments_actions
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS nutriments_actions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                mlParLitre FLOAT NOT NULL,
                nutrimentId INT NOT NULL,
                actionId INT NOT NULL,
                FOREIGN KEY (actionId) REFERENCES lot_action(id) ON DELETE CASCADE,
                INDEX idx_nutr_actions_actionId (actionId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 10. Table share_lots
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS share_lots (
                id CHAR(36) PRIMARY KEY,
                lotId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE,
                INDEX idx_share_lots_lotId (lotId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 11. Table producer_progress
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS producer_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                completedTasks JSON DEFAULT ('[]'),
                completedSubtasks JSON DEFAULT ('[]'),
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_producer_progress_userId (userId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 12. Table lots_transformation
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS lots_transformation (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                type_transformation ENUM('huile', 'hash', 'rosin', 'trim', 'autre') NOT NULL,
                hash_method ENUM('charas', 'bubble_hash', 'dry_sift', 'fresh_frozen') NULL,
                type_transformation_autre VARCHAR(255) NULL,
                quantite_obtenue DECIMAL(10,2) NOT NULL,
                stock DECIMAL(10,2) NOT NULL,
                rendement DECIMAL(5,2) NULL,
                tauxTHC DECIMAL(5,2) NOT NULL DEFAULT 0,
                tauxCBD DECIMAL(5,2) NOT NULL DEFAULT 0,
                perte_stock BOOLEAN DEFAULT FALSE,
                quantite_perdue DECIMAL(10,2) NULL,
                notes TEXT NULL,
                methode_extraction TEXT NULL,
                is_public BOOLEAN DEFAULT FALSE,
                uuid CHAR(36) UNIQUE NULL,
                userId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_lots_transf_userId (userId),
                INDEX idx_lots_transf_uuid (uuid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 13. Table lots_transformation_sources
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS lots_transformation_sources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lotTransformationId INT NOT NULL,
                lotSourceId INT NOT NULL,
                lot_source_type ENUM('plante', 'trim') NOT NULL,
                quantite_utilisee DECIMAL(10,2) NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                FOREIGN KEY (lotTransformationId) REFERENCES lots_transformation(id) ON DELETE CASCADE,
                FOREIGN KEY (lotSourceId) REFERENCES lots(id) ON DELETE CASCADE,
                INDEX idx_transf_sources_transfId (lotTransformationId),
                INDEX idx_transf_sources_lotId (lotSourceId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 14. Table stock_movements
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS stock_movements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lotId INT NULL,
                lot_type VARCHAR(20) NULL,
                lot_nom VARCHAR(255) NULL,
                movementType ENUM('entree', 'sortie', 'sale', 'loss', 'adjustment', 'transformation') DEFAULT 'adjustment',
                quantity DECIMAL(8,2) NOT NULL,
                reason TEXT NULL,
                transformation_id INT NULL,
                transformation_nom VARCHAR(255) NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE,
                FOREIGN KEY (transformation_id) REFERENCES lots_transformation(id) ON DELETE CASCADE,
                INDEX idx_stock_mov_lotId (lotId),
                INDEX idx_stock_mov_transfId (transformation_id),
                INDEX idx_stock_mov_created (createdAt)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer dans l'ordre inverse (foreign keys)
        await queryRunner.query(`DROP TABLE IF EXISTS stock_movements`);
        await queryRunner.query(`DROP TABLE IF EXISTS lots_transformation_sources`);
        await queryRunner.query(`DROP TABLE IF EXISTS lots_transformation`);
        await queryRunner.query(`DROP TABLE IF EXISTS producer_progress`);
        await queryRunner.query(`DROP TABLE IF EXISTS share_lots`);
        await queryRunner.query(`DROP TABLE IF EXISTS nutriments_actions`);
        await queryRunner.query(`DROP TABLE IF EXISTS lot_action`);
        await queryRunner.query(`DROP TABLE IF EXISTS nutriments`);
        await queryRunner.query(`DROP TABLE IF EXISTS conditions_environnementales`);
        await queryRunner.query(`DROP TABLE IF EXISTS environnements_lots`);
        await queryRunner.query(`DROP TABLE IF EXISTS lots`);
        await queryRunner.query(`DROP TABLE IF EXISTS environnements`);
        await queryRunner.query(`DROP TABLE IF EXISTS varietes`);
        await queryRunner.query(`DROP TABLE IF EXISTS users`);
    }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1727721500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Table users
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                nom VARCHAR(255) NOT NULL,
                organisation VARCHAR(255) NULL,
                role ENUM('producteur', 'admin', 'technicien') DEFAULT 'producteur',
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table varietes
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS varietes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                type ENUM('indica', 'sativa', 'hybride') NOT NULL,
                breeder VARCHAR(255) NULL,
                description TEXT NULL,
                tauxTHC DECIMAL(5,2) NULL,
                tauxCBD DECIMAL(5,2) NULL,
                floraison INT NULL,
                rendement VARCHAR(255) NULL,
                userId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table environnements
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS environnements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                type ENUM('culture', 'sechage', 'stockage', 'maturation') NOT NULL,
                userId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table lots
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS lots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                nombrePlante INT NOT NULL,
                etapeCulture ENUM('Croissance', 'Floraison', 'Sechage', 'Maturation', 'Stockage') DEFAULT 'Croissance',
                dateRecolte DATETIME NULL,
                dateSemis DATETIME NULL,
                quantite DECIMAL(10,2) NULL,
                stock DECIMAL(10,2) NULL DEFAULT 0,
                productType ENUM('fleur', 'trim') DEFAULT 'fleur',
                currentEnvironnementId INT NULL,
                userId INT NOT NULL,
                varieteId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (varieteId) REFERENCES varietes(id) ON DELETE CASCADE,
                FOREIGN KEY (currentEnvironnementId) REFERENCES environnements(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table environnement_lots
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS environnement_lots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dateDebut DATETIME NOT NULL,
                dateFin DATETIME NULL,
                etape ENUM('Croissance', 'Floraison', 'Sechage', 'Maturation', 'Stockage') NOT NULL,
                lotId INT NOT NULL,
                environnementId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE,
                FOREIGN KEY (environnementId) REFERENCES environnements(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table condition_environnementales
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS condition_environnementales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                temperature DECIMAL(5,2) NOT NULL,
                humidite DECIMAL(5,2) NOT NULL,
                date DATETIME NOT NULL,
                environnementId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                FOREIGN KEY (environnementId) REFERENCES environnements(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table nutriments
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS nutriments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                marque VARCHAR(255) NOT NULL,
                type ENUM('minerale', 'organique', 'chimique') DEFAULT 'organique',
                description TEXT NULL,
                isPublic BOOLEAN DEFAULT FALSE,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table lots_action
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS lots_action (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(255) NOT NULL,
                description TEXT NULL,
                date DATETIME NOT NULL,
                lotId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table nutriment_actions
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS nutriment_actions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                quantite DECIMAL(10,2) NOT NULL,
                lotActionId INT NOT NULL,
                nutrimentId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                FOREIGN KEY (lotActionId) REFERENCES lots_action(id) ON DELETE CASCADE,
                FOREIGN KEY (nutrimentId) REFERENCES nutriments(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table share_lots
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS share_lots (
                id VARCHAR(36) PRIMARY KEY,
                lotId INT NOT NULL UNIQUE,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table producer_progress
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS producer_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                userId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table stock_movements
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
                FOREIGN KEY (lotId) REFERENCES lots(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table lots_transformation
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
                uuid VARCHAR(36) UNIQUE NULL,
                userId INT NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table lots_transformation_sources
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS lots_transformation_sources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lotTransformationId INT NOT NULL,
                lotSourceId INT NOT NULL,
                lot_source_type ENUM('plante', 'trim') NOT NULL,
                quantite_utilisee DECIMAL(10,2) NOT NULL,
                createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                FOREIGN KEY (lotTransformationId) REFERENCES lots_transformation(id) ON DELETE CASCADE,
                FOREIGN KEY (lotSourceId) REFERENCES lots(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Ajouter la FK pour transformation_id dans stock_movements
        await queryRunner.query(`
            ALTER TABLE stock_movements
            ADD CONSTRAINT FK_stock_movements_transformation
            FOREIGN KEY (transformation_id) REFERENCES lots_transformation(id) ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS lots_transformation_sources`);
        await queryRunner.query(`DROP TABLE IF EXISTS lots_transformation`);
        await queryRunner.query(`DROP TABLE IF EXISTS stock_movements`);
        await queryRunner.query(`DROP TABLE IF EXISTS producer_progress`);
        await queryRunner.query(`DROP TABLE IF EXISTS share_lots`);
        await queryRunner.query(`DROP TABLE IF EXISTS nutriment_actions`);
        await queryRunner.query(`DROP TABLE IF EXISTS lots_action`);
        await queryRunner.query(`DROP TABLE IF EXISTS nutriments`);
        await queryRunner.query(`DROP TABLE IF EXISTS condition_environnementales`);
        await queryRunner.query(`DROP TABLE IF EXISTS environnement_lots`);
        await queryRunner.query(`DROP TABLE IF EXISTS lots`);
        await queryRunner.query(`DROP TABLE IF EXISTS environnements`);
        await queryRunner.query(`DROP TABLE IF EXISTS varietes`);
        await queryRunner.query(`DROP TABLE IF EXISTS users`);
    }
}

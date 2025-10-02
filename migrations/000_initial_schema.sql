-- Migration initiale: Schéma complet de la base de données
-- Date: 2025-09-30
-- Note: Ce fichier sert de référence. Si la base existe déjà, utiliser les migrations incrémentales.

-- Cette migration n'est à exécuter QUE si vous créez une nouvelle base de données from scratch
-- Sinon, utilisez les migrations incrémentales 001, 002, etc.

-- CREATE DATABASE IF NOT EXISTS magtrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE magtrack;

-- Note: Le schéma complet est géré par TypeORM avec synchronize: true
-- Ce fichier est un backup de référence pour documentation

-- Pour générer le schéma actuel:
-- mysqldump -uroot -proot --no-data magtrack > migrations/000_initial_schema.sql

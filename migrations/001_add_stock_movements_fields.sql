-- Migration: Ajout des champs pour les mouvements de stock des transformations
-- Date: 2025-09-30

-- Ajouter les nouveaux champs à stock_movements
ALTER TABLE stock_movements
ADD COLUMN lot_type VARCHAR(20) NULL AFTER lotId,
ADD COLUMN lot_nom VARCHAR(255) NULL AFTER lot_type,
ADD COLUMN transformation_id INT NULL AFTER reason,
ADD COLUMN transformation_nom VARCHAR(255) NULL AFTER transformation_id;

-- Modifier lotId pour le rendre nullable
ALTER TABLE stock_movements
MODIFY COLUMN lotId INT NULL;

-- Modifier la contrainte FK sur lotId pour la rendre nullable
ALTER TABLE stock_movements
DROP FOREIGN KEY IF EXISTS FK_7b75c399f270553017054ea41a3;

ALTER TABLE stock_movements
ADD CONSTRAINT FK_7b75c399f270553017054ea41a3
FOREIGN KEY (lotId) REFERENCES lots(id)
ON DELETE CASCADE;

-- Ajouter la contrainte FK sur transformation_id
ALTER TABLE stock_movements
ADD CONSTRAINT FK_10a64ff474059527eda17f65107
FOREIGN KEY (transformation_id) REFERENCES lots_transformation(id)
ON DELETE CASCADE;

-- Ajouter l'enum 'entree' et 'sortie' au movementType
ALTER TABLE stock_movements
MODIFY COLUMN movementType ENUM('entree', 'sortie', 'sale', 'loss', 'adjustment', 'transformation') DEFAULT 'adjustment';

-- Nettoyer les transformation_id invalides
UPDATE stock_movements
SET transformation_id = NULL
WHERE transformation_id IS NOT NULL
AND transformation_id NOT IN (SELECT id FROM lots_transformation);

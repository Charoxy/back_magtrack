-- Migration: Ajout des taux THC et CBD aux transformations
-- Date: 2025-09-30

-- Ajouter les colonnes tauxTHC et tauxCBD
ALTER TABLE lots_transformation
ADD COLUMN tauxTHC DECIMAL(5,2) NOT NULL AFTER rendement,
ADD COLUMN tauxCBD DECIMAL(5,2) NOT NULL AFTER tauxTHC;

-- Note: Si des transformations existent déjà, il faudra les mettre à jour manuellement
-- ou exécuter cette commande d'abord pour définir des valeurs par défaut:
-- UPDATE lots_transformation SET tauxTHC = 0, tauxCBD = 0 WHERE tauxTHC IS NULL;

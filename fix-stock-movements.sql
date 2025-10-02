-- Nettoyer les transformation_id invalides avant d'ajouter la contrainte FK
UPDATE stock_movements
SET transformation_id = NULL
WHERE transformation_id IS NOT NULL
AND transformation_id NOT IN (SELECT id FROM lots_transformation);

-- Vérifier les données après nettoyage
SELECT COUNT(*) as mouvements_avec_transformation_invalide
FROM stock_movements
WHERE transformation_id IS NOT NULL
AND transformation_id NOT IN (SELECT id FROM lots_transformation);

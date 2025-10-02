# Migrations Base de Données

Ce dossier contient les migrations SQL pour la base de données MagTrack.

## Comment appliquer les migrations

### Méthode 1: Via Docker
```bash
# Migration 001
docker exec -i back_magtrack-mariadb-1 mysql -uroot -proot magtrack < migrations/001_add_stock_movements_fields.sql

# Migration 002
docker exec -i back_magtrack-mariadb-1 mysql -uroot -proot magtrack < migrations/002_add_thc_cbd_to_transformations.sql
```

### Méthode 2: Via client MySQL
```bash
mysql -uroot -proot magtrack < migrations/001_add_stock_movements_fields.sql
mysql -uroot -proot magtrack < migrations/002_add_thc_cbd_to_transformations.sql
```

### Méthode 3: Copier-coller dans un client SQL
Ouvrir les fichiers .sql et copier-coller le contenu dans HeidiSQL, phpMyAdmin, etc.

## Liste des migrations

- **001_add_stock_movements_fields.sql**: Ajout des champs pour tracer les mouvements de stock des transformations
  - Champs: lot_type, lot_nom, transformation_id, transformation_nom
  - Modification: lotId nullable
  - Contraintes FK ajustées
  - Ajout des types 'entree' et 'sortie' au movementType

- **002_add_thc_cbd_to_transformations.sql**: Ajout des taux THC et CBD aux transformations
  - Champs: tauxTHC, tauxCBD (obligatoires)

## Désactiver synchronize

Une fois les migrations appliquées, modifier `src/app.module.ts`:

```typescript
TypeOrmModule.forRoot({
  // ...
  synchronize: false, // ⚠️ Passer à false en production
  // ...
})
```

## Créer une nouvelle migration

1. Créer un fichier `XXX_description.sql` avec un numéro séquentiel
2. Documenter les changements dans ce README
3. Tester la migration sur une base de données de développement
4. Appliquer en production

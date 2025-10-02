#!/bin/bash

# Script pour appliquer toutes les migrations
# Usage: ./scripts/apply-migrations.sh

CONTAINER_NAME="back_magtrack-mariadb-1"
DB_USER="root"
DB_PASSWORD="root"
DB_NAME="magtrack"
MIGRATIONS_DIR="./migrations"

echo "🔄 Application des migrations..."

# Vérifier que le container est en cours d'exécution
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Le container $CONTAINER_NAME n'est pas en cours d'exécution"
    exit 1
fi

# Appliquer chaque migration dans l'ordre
for migration in $MIGRATIONS_DIR/[0-9]*.sql; do
    if [ -f "$migration" ]; then
        echo "📝 Application de $(basename $migration)..."
        docker exec -i $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < "$migration"

        if [ $? -eq 0 ]; then
            echo "✅ $(basename $migration) appliquée avec succès"
        else
            echo "❌ Erreur lors de l'application de $(basename $migration)"
            exit 1
        fi
    fi
done

echo "✅ Toutes les migrations ont été appliquées avec succès!"

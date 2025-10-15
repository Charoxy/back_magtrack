import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class ConsolidatedMigration1729200000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // 1. Ajouter onboardingCompleted à la table users
        const usersTable = await queryRunner.getTable("users");
        const hasOnboardingCompleted = usersTable.findColumnByName("onboardingCompleted");

        if (!hasOnboardingCompleted) {
            await queryRunner.addColumn("users", new TableColumn({
                name: "onboardingCompleted",
                type: "boolean",
                default: false,
            }));
        }

        // 2. Créer la table media (si elle n'existe pas)
        const mediaTableExists = await queryRunner.hasTable("media");
        if (!mediaTableExists) {
            await queryRunner.createTable(new Table({
                name: "media",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "lotId",
                        type: "int",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["photo", "video"],
                    },
                    {
                        name: "url",
                        type: "varchar",
                        length: "500",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "dateUpload",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }), true);

            await queryRunner.createForeignKey("media", new TableForeignKey({
                columnNames: ["lotId"],
                referencedColumnNames: ["id"],
                referencedTableName: "lots",
                onDelete: "CASCADE",
            }));
        }

        // 3. Ajouter les colonnes à la table lots (avec vérifications)
        const lotsTable = await queryRunner.getTable("lots");

        if (!lotsTable.findColumnByName("substrat")) {
            await queryRunner.addColumn("lots", new TableColumn({
                name: "substrat",
                type: "enum",
                enum: ["terre", "hydroponie", "living soil", "coco"],
                isNullable: true,
            }));
        } else {
            // Mettre à jour l'enum pour inclure 'coco' si nécessaire
            await queryRunner.query(`
                ALTER TABLE \`lots\`
                MODIFY COLUMN \`substrat\` ENUM('terre', 'hydroponie', 'living soil', 'coco') NULL
            `);
        }

        if (!lotsTable.findColumnByName("origine")) {
            await queryRunner.addColumn("lots", new TableColumn({
                name: "origine",
                type: "enum",
                enum: ["graine", "clone_test", "clone_production", "pied_mere"],
                default: "'graine'",
            }));
        } else {
            // Mettre à jour l'enum pour inclure 'pied_mere' si nécessaire
            await queryRunner.query(`
                ALTER TABLE \`lots\`
                MODIFY COLUMN \`origine\` ENUM('graine', 'clone_test', 'clone_production', 'pied_mere') NOT NULL DEFAULT 'graine'
            `);
        }

        if (!lotsTable.findColumnByName("piedMereId")) {
            await queryRunner.addColumn("lots", new TableColumn({
                name: "piedMereId",
                type: "int",
                isNullable: true,
            }));
        }

        if (!lotsTable.findColumnByName("lotParentGrainesId")) {
            await queryRunner.addColumn("lots", new TableColumn({
                name: "lotParentGrainesId",
                type: "int",
                isNullable: true,
            }));
        }

        if (!lotsTable.findColumnByName("enAttenteSelection")) {
            await queryRunner.addColumn("lots", new TableColumn({
                name: "enAttenteSelection",
                type: "boolean",
                default: false,
            }));
        }

        if (!lotsTable.findColumnByName("lotClonesTestId")) {
            await queryRunner.addColumn("lots", new TableColumn({
                name: "lotClonesTestId",
                type: "int",
                isNullable: true,
            }));
        }

        if (!lotsTable.findColumnByName("clonesTestCrees")) {
            await queryRunner.addColumn("lots", new TableColumn({
                name: "clonesTestCrees",
                type: "boolean",
                default: false,
            }));
        }

        if (!lotsTable.findColumnByName("generation")) {
            await queryRunner.addColumn("lots", new TableColumn({
                name: "generation",
                type: "int",
                default: 0,
            }));
        }

        // 4. Créer la table pieds_meres (si elle n'existe pas)
        const piedsMeresTableExists = await queryRunner.hasTable("pieds_meres");
        if (!piedsMeresTableExists) {
            await queryRunner.createTable(new Table({
                name: "pieds_meres",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "nom",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "code",
                        type: "varchar",
                        length: "50",
                        isUnique: true,
                    },
                    {
                        name: "varieteId",
                        type: "int",
                    },
                    {
                        name: "userId",
                        type: "int",
                    },
                    {
                        name: "lotOrigineId",
                        type: "int",
                    },
                    {
                        name: "plantIndex",
                        type: "int",
                    },
                    {
                        name: "lotGrainesId",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "plantGrainesIndex",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "environnementId",
                        type: "int",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "caracteristiques",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "statut",
                        type: "enum",
                        enum: ["actif", "repos", "retiré"],
                        default: "'actif'",
                    },
                    {
                        name: "nombreClonesPrelevés",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "dernierPrelevement",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "dateCreation",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "dateRetrait",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "noteGlobale",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                        isNullable: true,
                    },
                    {
                        name: "notePuissance",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                        isNullable: true,
                    },
                    {
                        name: "noteGout",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                        isNullable: true,
                    },
                    {
                        name: "noteRendement",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                        isNullable: true,
                    },
                    {
                        name: "poidsRecolte",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "tauxTHC",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "tauxCBD",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "generation",
                        type: "int",
                        default: 1,
                    },
                    {
                        name: "lotId",
                        type: "int",
                        isNullable: true,
                    },
                ],
            }), true);

            // Foreign keys pour pieds_meres
            await queryRunner.createForeignKey("pieds_meres", new TableForeignKey({
                columnNames: ["varieteId"],
                referencedColumnNames: ["id"],
                referencedTableName: "varietes",
                onDelete: "CASCADE",
            }));

            await queryRunner.createForeignKey("pieds_meres", new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }));

            await queryRunner.createForeignKey("pieds_meres", new TableForeignKey({
                columnNames: ["lotOrigineId"],
                referencedColumnNames: ["id"],
                referencedTableName: "lots",
                onDelete: "CASCADE",
            }));

            await queryRunner.createForeignKey("pieds_meres", new TableForeignKey({
                columnNames: ["environnementId"],
                referencedColumnNames: ["id"],
                referencedTableName: "environnements",
                onDelete: "CASCADE",
            }));

            await queryRunner.createForeignKey("pieds_meres", new TableForeignKey({
                columnNames: ["lotId"],
                referencedColumnNames: ["id"],
                referencedTableName: "lots",
                onDelete: "SET NULL",
            }));
        } else {
            // Si la table existe, ajouter lotId si elle n'existe pas
            const piedsMeresTable = await queryRunner.getTable("pieds_meres");

            if (!piedsMeresTable.findColumnByName("generation")) {
                await queryRunner.addColumn("pieds_meres", new TableColumn({
                    name: "generation",
                    type: "int",
                    default: 1,
                }));
            }

            if (!piedsMeresTable.findColumnByName("lotId")) {
                await queryRunner.addColumn("pieds_meres", new TableColumn({
                    name: "lotId",
                    type: "int",
                    isNullable: true,
                }));

                await queryRunner.createForeignKey("pieds_meres", new TableForeignKey({
                    columnNames: ["lotId"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "lots",
                    onDelete: "SET NULL",
                }));
            }
        }

        // 5. Créer la table evaluation_plants (si elle n'existe pas)
        const evaluationPlantsTableExists = await queryRunner.hasTable("evaluation_plants");
        if (!evaluationPlantsTableExists) {
            await queryRunner.createTable(new Table({
                name: "evaluation_plants",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "lotId",
                        type: "int",
                    },
                    {
                        name: "plantIndex",
                        type: "int",
                    },
                    {
                        name: "userId",
                        type: "int",
                    },
                    {
                        name: "dateEvaluation",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "noteGlobale",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                    },
                    {
                        name: "notePuissance",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                        isNullable: true,
                    },
                    {
                        name: "noteGout",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                        isNullable: true,
                    },
                    {
                        name: "noteRendement",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                        isNullable: true,
                    },
                    {
                        name: "poidsRecolte",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "tauxTHC",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "tauxCBD",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: "notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "selectionne",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "piedMereId",
                        type: "int",
                        isNullable: true,
                    },
                ],
            }), true);

            // Foreign keys pour evaluation_plants
            await queryRunner.createForeignKey("evaluation_plants", new TableForeignKey({
                columnNames: ["lotId"],
                referencedColumnNames: ["id"],
                referencedTableName: "lots",
                onDelete: "CASCADE",
            }));

            await queryRunner.createForeignKey("evaluation_plants", new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }));

            await queryRunner.createForeignKey("evaluation_plants", new TableForeignKey({
                columnNames: ["piedMereId"],
                referencedColumnNames: ["id"],
                referencedTableName: "pieds_meres",
                onDelete: "SET NULL",
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer dans l'ordre inverse
        const evaluationPlantsTableExists = await queryRunner.hasTable("evaluation_plants");
        if (evaluationPlantsTableExists) {
            await queryRunner.dropTable("evaluation_plants");
        }

        const piedsMeresTableExists = await queryRunner.hasTable("pieds_meres");
        if (piedsMeresTableExists) {
            await queryRunner.dropTable("pieds_meres");
        }

        const lotsTable = await queryRunner.getTable("lots");
        if (lotsTable.findColumnByName("generation")) {
            await queryRunner.dropColumn("lots", "generation");
        }
        if (lotsTable.findColumnByName("clonesTestCrees")) {
            await queryRunner.dropColumn("lots", "clonesTestCrees");
        }
        if (lotsTable.findColumnByName("lotClonesTestId")) {
            await queryRunner.dropColumn("lots", "lotClonesTestId");
        }
        if (lotsTable.findColumnByName("enAttenteSelection")) {
            await queryRunner.dropColumn("lots", "enAttenteSelection");
        }
        if (lotsTable.findColumnByName("lotParentGrainesId")) {
            await queryRunner.dropColumn("lots", "lotParentGrainesId");
        }
        if (lotsTable.findColumnByName("piedMereId")) {
            await queryRunner.dropColumn("lots", "piedMereId");
        }
        if (lotsTable.findColumnByName("origine")) {
            await queryRunner.dropColumn("lots", "origine");
        }
        if (lotsTable.findColumnByName("substrat")) {
            await queryRunner.dropColumn("lots", "substrat");
        }

        const mediaTableExists = await queryRunner.hasTable("media");
        if (mediaTableExists) {
            await queryRunner.dropTable("media");
        }

        const usersTable = await queryRunner.getTable("users");
        if (usersTable.findColumnByName("onboardingCompleted")) {
            await queryRunner.dropColumn("users", "onboardingCompleted");
        }
    }
}

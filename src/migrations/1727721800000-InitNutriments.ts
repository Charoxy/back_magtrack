import { MigrationInterface, QueryRunner } from "typeorm";

export class InitNutriments1727721800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // BioBizz - 100% Organique
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Bio·Grow', 'BioBizz', 'organique', 'Engrais de croissance liquide 100% biologique NPK 8-2-6', 1),
            ('Bio·Bloom', 'BioBizz', 'organique', 'Engrais de floraison liquide 100% biologique NPK 2-7-4', 1),
            ('Fish·Mix', 'BioBizz', 'organique', 'Engrais organique à base de poisson NPK 5-1-4', 1),
            ('Top·Max', 'BioBizz', 'organique', 'Stimulateur de floraison 100% organique acides humiques', 1),
            ('Bio·Heaven', 'BioBizz', 'organique', 'Stimulateur énergétique antistress acides aminés', 1),
            ('Alg·A·Mic', 'BioBizz', 'organique', 'Revitalisant à base d''algues marines concentrées', 1),
            ('Root·Juice', 'BioBizz', 'organique', 'Stimulateur racinaire 100% biologique algues', 1),
            ('Acti·Vera', 'BioBizz', 'organique', 'Protecteur végétal naturel à l''aloe vera', 1)
        `);

        // Advanced Nutrients - Gamme chimique pH Perfect
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('pH Perfect Grow', 'Advanced Nutrients', 'chimique', 'Base croissance pH Perfect synthétique NPK 1-0-4', 1),
            ('pH Perfect Micro', 'Advanced Nutrients', 'chimique', 'Micro-nutriments pH Perfect NPK 2-0-0', 1),
            ('pH Perfect Bloom', 'Advanced Nutrients', 'chimique', 'Base floraison pH Perfect NPK 0-5-4', 1),
            ('Sensi Grow A', 'Advanced Nutrients', 'chimique', 'Base croissance 2 parties NPK 3-0-0', 1),
            ('Sensi Grow B', 'Advanced Nutrients', 'chimique', 'Base croissance 2 parties NPK 0-0-3', 1),
            ('Sensi Bloom A', 'Advanced Nutrients', 'chimique', 'Base floraison 2 parties NPK 3-0-0', 1),
            ('Sensi Bloom B', 'Advanced Nutrients', 'chimique', 'Base floraison 2 parties NPK 0-5-4', 1),
            ('Big Bud', 'Advanced Nutrients', 'chimique', 'Booster PK chimique NPK 0-1-3', 1),
            ('Overdrive', 'Advanced Nutrients', 'chimique', 'Booster fin floraison NPK 1-5-4', 1),
            ('Flawless Finish', 'Advanced Nutrients', 'chimique', 'Solution de rinçage final', 1)
        `);

        // Advanced Nutrients - Gamme Organic
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Iguana Juice Organic Grow', 'Advanced Nutrients', 'organique', 'Base 100% organique croissance NPK 3-1-3', 1),
            ('Iguana Juice Organic Bloom', 'Advanced Nutrients', 'organique', 'Base 100% organique floraison NPK 4-3-6', 1),
            ('Big Bud Organic', 'Advanced Nutrients', 'organique', 'Booster floraison organique', 1),
            ('Nirvana', 'Advanced Nutrients', 'organique', 'Booster organique premium floraison', 1),
            ('Ancient Earth Organic', 'Advanced Nutrients', 'organique', 'Acides humiques et fulviques organiques', 1),
            ('Voodoo Juice', 'Advanced Nutrients', 'organique', 'Bactéries bénéfiques Bacillus pour racines', 1),
            ('Piranha', 'Advanced Nutrients', 'organique', 'Mycorhizes Glomus pour absorption nutriments', 1),
            ('Tarantula', 'Advanced Nutrients', 'organique', 'Mix bactéries bénéfiques zone racinaire', 1),
            ('B-52', 'Advanced Nutrients', 'chimique', 'Vitamines B complexe formulé pour vigueur', 1),
            ('Bud Candy', 'Advanced Nutrients', 'chimique', 'Sucres acides aminés magnésium pour terpènes', 1),
            ('Sensizym', 'Advanced Nutrients', 'organique', 'Enzymes dégradation racines mortes', 1),
            ('Rhino Skin', 'Advanced Nutrients', 'minerale', 'Silice potassium pour renforcement', 1)
        `);

        // Plagron
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Terra Grow', 'Plagron', 'minerale', 'Engrais minéral croissance terre NPK 3-1-3', 1),
            ('Terra Bloom', 'Plagron', 'minerale', 'Engrais minéral floraison terre NPK 2-2-4', 1),
            ('Hydro A', 'Plagron', 'chimique', 'Base hydroponique partie A NPK 5-0-1', 1),
            ('Hydro B', 'Plagron', 'chimique', 'Base hydroponique partie B NPK 0-4-2', 1),
            ('Cocos A', 'Plagron', 'chimique', 'Base coco partie A NPK 5-0-0', 1),
            ('Cocos B', 'Plagron', 'chimique', 'Base coco partie B NPK 0-4-2', 1),
            ('Power Roots', 'Plagron', 'organique', 'Stimulateur racinaire concentré base algues', 1),
            ('Green Sensation', 'Plagron', 'chimique', 'Booster 4-en-1 fin floraison NPK 0-9-10', 1),
            ('Sugar Royal', 'Plagron', 'organique', 'Améliore goût et production résine base sucres', 1),
            ('Vita Race', 'Plagron', 'organique', 'Stimulateur résistance à base de silice', 1),
            ('Pure Zym', 'Plagron', 'organique', 'Complexe enzymatique naturel', 1)
        `);

        // Canna
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Terra Vega', 'Canna', 'minerale', 'Engrais minéral croissance terre NPK 3-1-3', 1),
            ('Terra Flores', 'Canna', 'minerale', 'Engrais minéral floraison terre NPK 2-2-4', 1),
            ('Coco A', 'Canna', 'chimique', 'Base coco buffered partie A NPK 5-0-0', 1),
            ('Coco B', 'Canna', 'chimique', 'Base coco buffered partie B NPK 0-4-2', 1),
            ('Aqua Vega A', 'Canna', 'chimique', 'Base hydro croissance A NPK 5-0-1', 1),
            ('Aqua Vega B', 'Canna', 'chimique', 'Base hydro croissance B NPK 0-4-2', 1),
            ('Aqua Flores A', 'Canna', 'chimique', 'Base hydro floraison A NPK 5-0-0', 1),
            ('Aqua Flores B', 'Canna', 'chimique', 'Base hydro floraison B NPK 0-5-4', 1),
            ('Rhizotonic', 'Canna', 'organique', 'Stimulateur racinaire à base d''algues', 1),
            ('Cannazym', 'Canna', 'organique', 'Enzymes pour recyclage nutriments', 1),
            ('Boost', 'Canna', 'organique', 'Accélérateur métabolisme floraison', 1),
            ('PK 13/14', 'Canna', 'chimique', 'Booster phosphore-potassium NPK 0-13-14', 1),
            ('CannaStart', 'Canna', 'chimique', 'Engrais complet boutures et semis', 1),
            ('Mono Ca 15%', 'Canna', 'chimique', 'Calcium additionnel 15%', 1),
            ('Mono N 27%', 'Canna', 'chimique', 'Azote additionnel NPK 27-0-0', 1),
            ('Mono Fe', 'Canna', 'chimique', 'Fer chélaté EDDHA pour carences', 1)
        `);

        // General Hydroponics / Terra Aquatica
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('FloraGro', 'General Hydroponics', 'chimique', 'Base 3 parties croissance NPK 2-1-6', 1),
            ('FloraMicro', 'General Hydroponics', 'chimique', 'Base 3 parties micro NPK 5-0-1', 1),
            ('FloraBloom', 'General Hydroponics', 'chimique', 'Base 3 parties floraison NPK 0-5-4', 1),
            ('BioSevia Grow', 'General Hydroponics', 'organique', 'Base organique croissance NPK 4-3-3', 1),
            ('BioSevia Bloom', 'General Hydroponics', 'organique', 'Base organique floraison NPK 4-4-5', 1),
            ('Diamond Nectar', 'General Hydroponics', 'organique', 'Acides humiques et fulviques concentrés', 1),
            ('FloraKleen', 'General Hydroponics', 'chimique', 'Solution de rinçage système', 1),
            ('Ripen', 'General Hydroponics', 'chimique', 'Finisseur NPK 0-6-5', 1),
            ('TriPart Grow', 'Terra Aquatica', 'chimique', 'Base 3 parties croissance NPK 3-1-6', 1),
            ('TriPart Micro', 'Terra Aquatica', 'chimique', 'Base 3 parties micro NPK 5-0-1', 1),
            ('TriPart Bloom', 'Terra Aquatica', 'chimique', 'Base 3 parties floraison NPK 0-5-4', 1),
            ('Pro Organic Grow', 'Terra Aquatica', 'organique', 'Base organique croissance NPK 3-1-6', 1),
            ('Pro Organic Bloom', 'Terra Aquatica', 'organique', 'Base organique floraison NPK 2-1-6', 1)
        `);

        // House & Garden
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Soil A', 'House & Garden', 'chimique', 'Base terre ultra-pure partie A NPK 3-0-0', 1),
            ('Soil B', 'House & Garden', 'chimique', 'Base terre ultra-pure partie B NPK 0-3-3', 1),
            ('Cocos A', 'House & Garden', 'chimique', 'Base coco ultra-pure partie A NPK 5-0-0', 1),
            ('Cocos B', 'House & Garden', 'chimique', 'Base coco ultra-pure partie B NPK 0-4-3', 1),
            ('Root Excelurator', 'House & Garden', 'organique', 'Stimulateur racinaire premium ultra-concentré', 1),
            ('Bud-XL', 'House & Garden', 'chimique', 'Booster cellules floraison NPK 0-0-1', 1),
            ('Top Booster', 'House & Garden', 'chimique', 'Finisseur NPK 4-0-5', 1),
            ('Shooting Powder', 'House & Garden', 'chimique', 'PK booster extrême sachet NPK 0-0-1', 1),
            ('Algen Extract', 'House & Garden', 'organique', 'Extrait d''algues marines Ascophyllum', 1),
            ('Amino Treatment', 'House & Garden', 'organique', 'Acides aminés L-form assimilables', 1),
            ('Drip Clean', 'House & Garden', 'chimique', 'Nettoyant préventif magnésium', 1)
        `);

        // Hesi
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('TNT Complex', 'Hesi', 'minerale', 'Engrais croissance terre NPK 3-2-3', 1),
            ('Bloom Complex', 'Hesi', 'minerale', 'Engrais floraison terre NPK 3-2-5', 1),
            ('Hydro Veg', 'Hesi', 'chimique', 'Engrais croissance hydro NPK 3-2-3', 1),
            ('Hydro Bloom', 'Hesi', 'chimique', 'Engrais floraison hydro NPK 3-2-5', 1),
            ('Coco', 'Hesi', 'chimique', 'Engrais complet coco NPK 3-2-3', 1),
            ('Root Complex', 'Hesi', 'organique', 'Stimulateur racinaire concentré', 1),
            ('SuperVit', 'Hesi', 'organique', 'Mix vitamines acides aminés ultra-dosé', 1),
            ('PK 13/14', 'Hesi', 'chimique', 'Booster PK NPK 0-13-14', 1),
            ('Boost', 'Hesi', 'organique', 'Booster floraison complexe fructose', 1),
            ('PowerZyme', 'Hesi', 'organique', 'Complexe enzymatique', 1)
        `);

        // Green House
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Powder Grow', 'Green House', 'minerale', 'Engrais poudre one-part NPK 16-6-20', 1),
            ('Powder Bloom', 'Green House', 'minerale', 'Engrais poudre floraison NPK 12-6-19', 1),
            ('Powder Long Flowering', 'Green House', 'minerale', 'Engrais poudre floraison longue NPK 10-6-20', 1),
            ('Powder Short Flowering', 'Green House', 'minerale', 'Engrais poudre floraison courte NPK 15-7-22', 1),
            ('Powder Hybrids', 'Green House', 'minerale', 'Engrais poudre hybrides NPK 15-7-22', 1)
        `);

        // Aptus
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Start Boost', 'Aptus', 'organique', 'Stimulateur germination enracinement', 1),
            ('Regulator', 'Aptus', 'organique', 'Régulateur croissance anti-stress', 1),
            ('CaMg Boost', 'Aptus', 'chimique', 'Calcium magnésium azote NPK 4-0-0', 1),
            ('Topbooster', 'Aptus', 'chimique', 'Booster métabolisme NPK 3-1-5', 1),
            ('P-Boost', 'Aptus', 'chimique', 'Booster phosphore NPK 0-16-14', 1),
            ('K-Boost', 'Aptus', 'chimique', 'Booster potassium NPK 0-0-27', 1),
            ('Finalizer', 'Aptus', 'organique', 'Finisseur maturation', 1)
        `);

        // Mills
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Basis A', 'Mills', 'chimique', 'Base ultra-pure bioponics partie A NPK 5-0-0', 1),
            ('Basis B', 'Mills', 'chimique', 'Base ultra-pure bioponics partie B NPK 0-4-5', 1),
            ('Start-R', 'Mills', 'organique', 'Stimulateur racines et semis', 1),
            ('C4', 'Mills', 'organique', 'Booster floraison organique NPK 0-0-1', 1),
            ('Vitalize', 'Mills', 'minerale', 'Silice liquide pour renforcement', 1),
            ('Ultimate PK', 'Mills', 'chimique', 'Booster PK premium NPK 0-13-14', 1)
        `);

        // Metrop
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('MAM', 'Metrop', 'chimique', 'Engrais mère croissance concentré NPK 10-40-20', 1),
            ('MR1', 'Metrop', 'chimique', 'Engrais floraison concentré NPK 4-2-4', 1),
            ('MR2', 'Metrop', 'chimique', 'Engrais fin floraison concentré NPK 5-3-7', 1),
            ('Calgreen', 'Metrop', 'chimique', 'Calcium magnésium fer concentré', 1),
            ('Amino Root', 'Metrop', 'organique', 'Acides aminés développement racinaire', 1),
            ('Amino Bloom', 'Metrop', 'organique', 'Acides aminés floraison', 1)
        `);

        // Amendements organiques naturels
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Thé de Compost', 'Fait Maison', 'organique', 'Infusion aérée de compost riche en microorganismes', 1),
            ('Thé de Lombricompost', 'Fait Maison', 'organique', 'Infusion de vermicompost microbes bénéfiques', 1),
            ('Purin d''Ortie', 'Fait Maison', 'organique', 'Macération ortie azote et minéraux NPK 5-1-1', 1),
            ('Purin de Consoude', 'Fait Maison', 'organique', 'Macération consoude potassium NPK 1-1-5', 1),
            ('Purin de Prêle', 'Fait Maison', 'organique', 'Macération prêle silice fongicide préventif', 1),
            ('Fumier de Poule', 'Biologique', 'organique', 'Fumier composté riche azote NPK 4-2-2', 1),
            ('Fumier de Cheval', 'Biologique', 'organique', 'Fumier composté équilibré NPK 2-1-2', 1),
            ('Guano de Chauve-souris', 'Biologique', 'organique', 'Guano riche phosphore floraison NPK 3-10-1', 1),
            ('Guano d''Oiseaux de Mer', 'Biologique', 'organique', 'Guano équilibré complet NPK 12-12-2', 1),
            ('Farine de Sang', 'Biologique', 'organique', 'Azote à libération rapide NPK 12-0-0', 1),
            ('Farine d''Os', 'Biologique', 'organique', 'Phosphore à libération lente NPK 4-12-0', 1),
            ('Farine de Plumes', 'Biologique', 'organique', 'Azote à libération lente NPK 12-0-0', 1),
            ('Tourteau de Neem', 'Biologique', 'organique', 'Engrais et insecticide naturel NPK 6-1-2', 1),
            ('Tourteau de Ricin', 'Biologique', 'organique', 'Engrais et répulsif ravageurs NPK 6-2-1', 1),
            ('Poudre de Kelp', 'Biologique', 'organique', 'Algues marines hormones croissance oligos', 1),
            ('Mélasse', 'Biologique', 'organique', 'Sucres complexes nourriture microbes', 1),
            ('Acides Humiques', 'Biologique', 'organique', 'Acides humiques et fulviques naturels', 1),
            ('Biochar', 'Biologique', 'organique', 'Charbon actif rétention eau et nutriments', 1),
            ('Cendres de Bois', 'Biologique', 'organique', 'Potassium et calcium naturels NPK 0-1-3', 1),
            ('Basalte', 'Biologique', 'minerale', 'Poudre de roche volcanique reminéralisant', 1),
            ('Azomite', 'Biologique', 'minerale', 'Poudre volcanique 70+ oligo-éléments', 1),
            ('Dolomite', 'Biologique', 'minerale', 'Calcaire magnésien pH calcium magnésium', 1),
            ('Gypse', 'Biologique', 'minerale', 'Sulfate de calcium améliore structure sol', 1)
        `);

        // Divers
        await queryRunner.query(`
            INSERT INTO nutriments (nom, marque, type, description, isPublic) VALUES
            ('Formulex', 'Growth Technology', 'chimique', 'Engrais universel jeunes plantes NPK 2-1-4', 1)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM nutriments WHERE isPublic = 1`);
    }
}

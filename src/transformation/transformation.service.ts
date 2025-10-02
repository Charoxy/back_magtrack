import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotTransformation } from '../entities/entitie.lots-transformation';
import { LotTransformationSource } from '../entities/entitie.lots-transformation-sources';
import { Lot } from '../entities/entitie.lots';
import { StockService } from '../stock/stock.service';
import { CreateTransformationLotDto } from '../dto/create-transformation-lot.dto';
import { UpdateTransformationLotDto } from '../dto/update-transformation-lot.dto';

@Injectable()
export class TransformationService {
  constructor(
    @InjectRepository(LotTransformation)
    private transformationRepository: Repository<LotTransformation>,
    @InjectRepository(LotTransformationSource)
    private transformationSourceRepository: Repository<LotTransformationSource>,
    @InjectRepository(Lot)
    private lotRepository: Repository<Lot>,
    private stockService: StockService,
  ) {}

  async create(dto: CreateTransformationLotDto, userId: number) {
    // Validation
    if (dto.type_transformation === 'hash' && !dto.hash_method) {
      throw new BadRequestException('hash_method est requis pour le type Hash');
    }

    if (dto.type_transformation === 'autre' && !dto.type_transformation_autre) {
      throw new BadRequestException('type_transformation_autre est requis pour le type Autre');
    }

    if (dto.perte_stock && !dto.quantite_perdue) {
      throw new BadRequestException('quantite_perdue est requis si perte_stock = true');
    }

    if (dto.sources.length === 0) {
      throw new BadRequestException('Au moins une source est requise');
    }

    // Vérifier le stock disponible de TOUTES les sources avant de commencer
    let totalUtilise = 0;
    const sourcesData = [];

    for (const source of dto.sources) {
      let sourceLot: any;
      let stockDisponible: number;
      let nomLot: string;

      if (source.lot_source_type === 'plante') {
        // Chercher dans la table lots (plantes)
        sourceLot = await this.lotRepository.findOne({
          where: { id: source.lot_source_id, userId }
        });

        if (!sourceLot) {
          throw new NotFoundException(`Lot de plante ${source.lot_source_id} non trouvé`);
        }

        stockDisponible = sourceLot.stock || 0;
        nomLot = sourceLot.nom;
      } else {
        // Chercher dans la table transformations (trim, hash, etc.)
        sourceLot = await this.transformationRepository.findOne({
          where: { id: source.lot_source_id, userId }
        });

        if (!sourceLot) {
          throw new NotFoundException(`Lot de transformation ${source.lot_source_id} non trouvé`);
        }

        stockDisponible = parseFloat(String(sourceLot.stock || 0));
        nomLot = sourceLot.nom;
      }

      if (stockDisponible < source.quantite_utilisee) {
        throw new BadRequestException(
          `Stock insuffisant pour le lot ${nomLot}. Disponible: ${stockDisponible}g, Demandé: ${source.quantite_utilisee}g`
        );
      }

      // Stocker les données pour utilisation après création
      sourcesData.push({
        source,
        nomLot
      });

      totalUtilise += source.quantite_utilisee;
    }

    // Calculer le rendement si non fourni
    let rendement = dto.rendement;
    if (rendement === undefined || rendement === null) {
      // Si aucune quantité utilisée, le rendement est null ou 0
      rendement = totalUtilise > 0 ? (dto.quantite_obtenue / totalUtilise) * 100 : null;
    }

    // Créer le lot de transformation
    const transformation = this.transformationRepository.create({
      nom: dto.nom,
      type_transformation: dto.type_transformation,
      hash_method: dto.hash_method,
      type_transformation_autre: dto.type_transformation_autre,
      quantite_obtenue: dto.quantite_obtenue,
      stock: dto.quantite_obtenue, // Stock initial = quantité obtenue
      rendement: rendement,
      tauxTHC: dto.tauxTHC,
      tauxCBD: dto.tauxCBD,
      perte_stock: dto.perte_stock,
      quantite_perdue: dto.quantite_perdue,
      notes: dto.notes,
      methode_extraction: dto.methode_extraction,
      userId: userId,
    });

    const savedTransformation = await this.transformationRepository.save(transformation);

    // Maintenant que tout est validé, créer les sources et déduire le stock
    for (const sourceData of sourcesData) {
      const { source, nomLot } = sourceData;

      // Créer l'entrée source
      const transformationSource = this.transformationSourceRepository.create({
        lotTransformationId: savedTransformation.id,
        lotSourceId: source.lot_source_id,
        lot_source_type: source.lot_source_type,
        quantite_utilisee: source.quantite_utilisee,
      });

      await this.transformationSourceRepository.save(transformationSource);

      // Déduire le stock selon le type de source
      if (source.lot_source_type === 'plante') {
        // Mettre à jour le stock de plante
        await this.lotRepository.query(
          'UPDATE lots SET stock = GREATEST(COALESCE(stock, 0) - ?, 0) WHERE id = ?',
          [source.quantite_utilisee, source.lot_source_id]
        );

        // Créer un mouvement de SORTIE sur le lot de plante
        await this.stockService.createStockMovement(
          source.lot_source_id,
          'sortie',
          source.quantite_utilisee,
          `Transformation vers ${dto.nom}`,
          userId,
          'plante',
          nomLot,
          savedTransformation.id,
          dto.nom
        );
      } else {
        // Mettre à jour le stock de transformation
        const transformationSource = await this.transformationRepository.findOne({
          where: { id: source.lot_source_id }
        });

        if (transformationSource) {
          const newStock = Math.max(0, parseFloat(String(transformationSource.stock)) - source.quantite_utilisee);
          await this.transformationRepository.update(
            source.lot_source_id,
            { stock: newStock }
          );

          // Créer un mouvement de SORTIE sur le lot de transformation
          await this.stockService.createStockMovement(
            source.lot_source_id,
            'sortie',
            source.quantite_utilisee,
            `Transformation vers ${dto.nom}`,
            userId,
            'transformation',
            nomLot,
            savedTransformation.id,
            dto.nom
          );
        }
      }
    }

    // Créer un mouvement d'ENTRÉE pour la transformation créée
    await this.stockService.createStockMovement(
      savedTransformation.id,
      'entree',
      dto.quantite_obtenue,
      'Production de la transformation',
      userId,
      'transformation',
      dto.nom,
      null,
      null
    );

    // Si perte de stock, créer un mouvement
    if (dto.perte_stock && dto.quantite_perdue > 0) {
      await this.stockService.createStockMovement(
        savedTransformation.id,
        'loss',
        dto.quantite_perdue,
        'Perte durant la transformation',
        userId,
        'transformation',
        dto.nom,
        null,
        null
      );
    }

    return this.findOne(savedTransformation.id, userId);
  }

  async findAll(userId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [data, total] = await this.transformationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const enrichedData = await Promise.all(
      data.map(async (transformation) => {
        const sources = await this.transformationSourceRepository
          .createQueryBuilder('ts')
          .leftJoinAndSelect('ts.lotSource', 'lot')
          .where('ts.lotTransformationId = :id', { id: transformation.id })
          .getMany();

        const sourcesPreview = sources
          .map(s => s.lotSource.nom)
          .join(', ')
          .substring(0, 100);

        return {
          id: transformation.id,
          nom: transformation.nom,
          type_transformation: transformation.type_transformation,
          hash_method: transformation.hash_method,
          type_transformation_autre: transformation.type_transformation_autre,
          quantite_obtenue: parseFloat(String(transformation.quantite_obtenue)),
          stock: parseFloat(String(transformation.stock)),
          rendement: parseFloat(String(transformation.rendement)),
          is_public: transformation.is_public,
          uuid: transformation.uuid,
          createdAt: transformation.createdAt,
          sources_count: sources.length,
          sources_preview: sourcesPreview,
        };
      })
    );

    return {
      data: enrichedData,
      total,
      page,
      limit,
    };
  }

  async getAvailableLots(userId: number, type?: string) {
    const queryBuilder = this.transformationRepository
      .createQueryBuilder('transformation')
      .where('transformation.userId = :userId', { userId })
      .andWhere('transformation.stock > 0');

    if (type) {
      queryBuilder.andWhere('transformation.type_transformation = :type', { type });
    }

    const transformations = await queryBuilder
      .orderBy('transformation.createdAt', 'DESC')
      .getMany();

    return transformations.map(t => ({
      id: t.id,
      nom: t.nom,
      type_transformation: t.type_transformation,
      hash_method: t.hash_method,
      type_transformation_autre: t.type_transformation_autre,
      stock: parseFloat(String(t.stock)),
      quantite_obtenue: parseFloat(String(t.quantite_obtenue)),
      rendement: parseFloat(String(t.rendement)),
      createdAt: t.createdAt,
    }));
  }

  async findOne(id: number, userId: number) {
    const transformation = await this.transformationRepository.findOne({
      where: { id, userId },
    });

    if (!transformation) {
      throw new NotFoundException('Lot de transformation non trouvé');
    }

    const sources = await this.transformationSourceRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.lotSource', 'lot')
      .leftJoinAndSelect('lot.variete', 'variete')
      .where('ts.lotTransformationId = :id', { id })
      .getMany();

    const sourcesFormatted = sources.map(s => ({
      id: s.id,
      lot_source_id: s.lotSourceId,
      lot_nom: s.lotSource.nom,
      lot_source_type: s.lot_source_type,
      quantite_utilisee: parseFloat(String(s.quantite_utilisee)),
      variete: s.lotSource.variete ? {
        nom: s.lotSource.variete.nom,
        type: s.lotSource.variete.type,
        breeder: s.lotSource.variete.breeder,
        tauxTHC: parseFloat(String(s.lotSource.variete.tauxTHC || 0)),
        tauxCBD: parseFloat(String(s.lotSource.variete.tauxCBD || 0)),
      } : null,
    }));

    // Récupérer les mouvements de stock
    const mouvements = await this.stockService.getStockMovements(userId, 365, id);

    return {
      id: transformation.id,
      nom: transformation.nom,
      type_transformation: transformation.type_transformation,
      hash_method: transformation.hash_method,
      type_transformation_autre: transformation.type_transformation_autre,
      quantite_obtenue: parseFloat(String(transformation.quantite_obtenue)),
      stock: parseFloat(String(transformation.stock)),
      rendement: parseFloat(String(transformation.rendement)),
      tauxTHC: parseFloat(String(transformation.tauxTHC)),
      tauxCBD: parseFloat(String(transformation.tauxCBD)),
      perte_stock: transformation.perte_stock,
      quantite_perdue: transformation.quantite_perdue ? parseFloat(String(transformation.quantite_perdue)) : null,
      notes: transformation.notes,
      methode_extraction: transformation.methode_extraction,
      is_public: transformation.is_public,
      uuid: transformation.uuid,
      createdAt: transformation.createdAt,
      updatedAt: transformation.updatedAt,
      sources: sourcesFormatted,
      mouvements: mouvements,
    };
  }

  async findByUuid(uuid: string) {
    const transformation = await this.transformationRepository.findOne({
      where: { uuid, is_public: true },
    });

    if (!transformation) {
      throw new NotFoundException('Lot de transformation public non trouvé');
    }

    const sources = await this.transformationSourceRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.lotSource', 'lot')
      .leftJoinAndSelect('lot.variete', 'variete')
      .where('ts.lotTransformationId = :id', { id: transformation.id })
      .getMany();

    const sourcesFormatted = await Promise.all(
      sources.map(async (s) => {
        const lotSource = s.lotSource;

        // Vérifier si le lot source est partagé publiquement via ShareLots
        const shareLot = await this.lotRepository
          .createQueryBuilder('lot')
          .leftJoinAndSelect('lot.shareLots', 'shareLots')
          .where('lot.id = :id', { id: lotSource.id })
          .getOne();

        const lotPublicUuid = shareLot?.shareLots?.id || null;

        return {
          lot_nom: lotSource.nom,
          lot_source_type: s.lot_source_type,
          quantite_utilisee: parseFloat(String(s.quantite_utilisee)),
          lot_public_uuid: lotPublicUuid,
          variete: lotSource.variete ? {
            nom: lotSource.variete.nom,
            type: lotSource.variete.type,
            breeder: lotSource.variete.breeder,
            tauxTHC: parseFloat(String(lotSource.variete.tauxTHC || 0)),
            tauxCBD: parseFloat(String(lotSource.variete.tauxCBD || 0)),
          } : null,
        };
      })
    );

    return {
      nom: transformation.nom,
      type_transformation: transformation.type_transformation,
      hash_method: transformation.hash_method,
      type_transformation_autre: transformation.type_transformation_autre,
      quantite_obtenue: parseFloat(String(transformation.quantite_obtenue)),
      rendement: parseFloat(String(transformation.rendement)),
      tauxTHC: parseFloat(String(transformation.tauxTHC)),
      tauxCBD: parseFloat(String(transformation.tauxCBD)),
      methode_extraction: transformation.methode_extraction,
      notes: transformation.notes,
      created_at: transformation.createdAt,
      sources: sourcesFormatted,
    };
  }

  async update(id: number, dto: UpdateTransformationLotDto, userId: number) {
    const transformation = await this.transformationRepository.findOne({
      where: { id, userId },
    });

    if (!transformation) {
      throw new NotFoundException('Lot de transformation non trouvé');
    }

    Object.assign(transformation, dto);
    await this.transformationRepository.save(transformation);

    return this.findOne(id, userId);
  }

  async updateShare(id: number, isPublic: boolean, userId: number) {
    const transformation = await this.transformationRepository.findOne({
      where: { id, userId },
    });

    if (!transformation) {
      throw new NotFoundException('Lot de transformation non trouvé');
    }

    transformation.is_public = isPublic;
    await this.transformationRepository.save(transformation);

    return {
      uuid: transformation.uuid,
      is_public: transformation.is_public,
    };
  }

  async remove(id: number, userId: number) {
    const transformation = await this.transformationRepository.findOne({
      where: { id, userId },
    });

    if (!transformation) {
      throw new NotFoundException('Lot de transformation non trouvé');
    }

    await this.transformationRepository.remove(transformation);

    return { message: 'Lot de transformation supprimé avec succès' };
  }
}
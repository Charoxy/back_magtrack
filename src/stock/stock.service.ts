import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lot } from '../entities/entitie.lots';
import { StockMovement } from '../entities/entitie.stock-movement';
import { Variete } from '../entities/entitie.variete';
import { LotTransformation } from '../entities/entitie.lots-transformation';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Lot)
    private lotRepository: Repository<Lot>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Variete)
    private varieteRepository: Repository<Variete>,
    @InjectRepository(LotTransformation)
    private transformationRepository: Repository<LotTransformation>,
  ) {}

  async getStockMovements(userId: number, days: number = 30, lotId?: number) {
    let whereClause = 'WHERE l.userId = ? AND sm.createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    let queryParams = [userId, days];

    if (lotId) {
      whereClause += ' AND sm.lotId = ?';
      queryParams.push(lotId);
    }

    const movements = await this.lotRepository.query(`
      SELECT
        sm.id,
        sm.lotId,
        sm.movementType as type,
        sm.quantity,
        sm.reason,
        sm.createdAt as date,
        l.nom as lotNom
      FROM stock_movements sm
      JOIN lots l ON sm.lotId = l.id
      ${whereClause}
      ORDER BY sm.createdAt DESC
      LIMIT 50
    `, queryParams);

    return movements.map(movement => ({
      id: movement.id,
      lotId: movement.lotId,
      type: movement.type,
      quantity: parseFloat(movement.quantity),
      reason: movement.reason,
      date: movement.date,
      lotNom: movement.lotNom
    }));
  }

  async getStockMovementsPaginated(
    userId: number,
    page: number = 1,
    limit: number = 10,
    days?: number,
    lotId?: number,
    lotType?: 'plante' | 'trim' | 'transformation',
    transformationId?: number
  ) {
    const offset = (page - 1) * limit;

    // Build the WHERE clause with optional filters
    let whereClause = 'WHERE (l.userId = ? OR lt.userId = ? OR (l.userId IS NULL AND lt.userId IS NULL))';
    let queryParams: any[] = [userId, userId];

    if (days) {
      whereClause += ' AND sm.createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)';
      queryParams.push(days);
    }

    if (lotId && lotType) {
      if (lotType === 'transformation') {
        whereClause += ' AND sm.transformation_id = ? AND sm.lot_type = ?';
        queryParams.push(lotId);
        queryParams.push(lotType);
      } else {
        whereClause += ' AND sm.lotId = ? AND sm.lot_type = ?';
        queryParams.push(lotId);
        queryParams.push(lotType);
      }
    } else if (lotId) {
      whereClause += ' AND sm.lotId = ?';
      queryParams.push(lotId);
    }

    if (transformationId) {
      whereClause += ' AND sm.transformation_id = ?';
      queryParams.push(transformationId);
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM stock_movements sm
      LEFT JOIN lots l ON sm.lotId = l.id AND (sm.lot_type = 'plante' OR sm.lot_type IS NULL)
      LEFT JOIN lots_transformation lt ON sm.lotId = lt.id AND sm.lot_type = 'transformation'
      ${whereClause}
    `;

    const [countResult] = await this.lotRepository.query(countQuery, queryParams);
    const total = parseInt(countResult.total);

    // Get paginated movements - utiliser COALESCE pour récupérer le nom du lot
    const movementsQuery = `
      SELECT
        sm.id,
        COALESCE(sm.lotId, sm.transformation_id) as lotId,
        sm.lot_type,
        COALESCE(sm.lot_nom, l.nom, lt.nom) as lot_nom,
        sm.movementType,
        sm.quantity,
        sm.reason,
        sm.transformation_id,
        sm.transformation_nom,
        sm.createdAt as date
      FROM stock_movements sm
      LEFT JOIN lots l ON sm.lotId = l.id
      LEFT JOIN lots_transformation lt ON sm.transformation_id = lt.id
      ${whereClause}
      ORDER BY sm.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const movements = await this.lotRepository.query(movementsQuery, queryParams);

    // Map movement types to match API requirements (entree/sortie)
    const mappedMovements = movements.map(movement => ({
      id: movement.id,
      lot_nom: movement.lot_nom,
      lot_type: movement.lot_type || 'plante',
      type: this.mapMovementType(movement.movementType),
      quantite: parseFloat(movement.quantity),
      date: movement.date,
      motif: movement.reason || '',
      transformation_id: movement.transformation_id,
      transformation_nom: movement.transformation_nom
    }));

    return {
      movements: mappedMovements,
      total,
      page,
      limit
    };
  }

  private mapMovementType(dbType: string): 'entree' | 'sortie' {
    // Map database movement types to API response types
    switch (dbType) {
      case 'entree':
        return 'entree';
      case 'sortie':
        return 'sortie';
      case 'adjustment':
        return 'entree'; // Assume positive adjustment is stock entry
      case 'transformation':
        return 'entree'; // Product transformation adds to stock
      case 'sale':
      case 'loss':
        return 'sortie'; // Sales and losses remove from stock
      default:
        return 'sortie'; // Default to exit for unknown types
    }
  }

  async createStockMovement(
    lotId: number,
    movementType: string,
    quantity: number,
    reason?: string,
    userId?: number,
    lot_type?: string,
    lot_nom?: string,
    transformation_id?: number,
    transformation_nom?: string
  ) {
    // Verify that the lot belongs to the user if userId is provided
    if (userId) {
      let lotExists = false;

      if (lot_type === 'transformation') {
        // Vérifier dans la table lots_transformation
        const transformation = await this.transformationRepository.findOne({
          where: { id: lotId, userId }
        });
        lotExists = !!transformation;
      } else {
        // Vérifier dans la table lots (plante)
        const lot = await this.lotRepository.findOne({
          where: { id: lotId, userId }
        });
        lotExists = !!lot;
      }

      if (!lotExists) {
        throw new Error('Lot not found or access denied');
      }
    }

    // Si c'est une transformation, on stocke l'ID dans transformation_id, pas dans lotId
    const stockMovement = this.stockMovementRepository.create({
      lotId: lot_type === 'transformation' ? null : lotId,
      transformation_id: lot_type === 'transformation' ? lotId : transformation_id,
      movementType,
      quantity,
      reason,
      lot_type,
      lot_nom,
      transformation_nom
    });

    return await this.stockMovementRepository.save(stockMovement);
  }

  async updateStock(lotId: number, operation: 'add' | 'remove', quantity: number, reason?: string, userId?: number) {
    // Verify that the lot belongs to the user
    if (userId) {
      const lot = await this.lotRepository.findOne({
        where: { id: lotId, userId }
      });

      if (!lot) {
        throw new Error('Lot not found or access denied');
      }
    }

    // Determine movement type based on operation
    const movementType = operation === 'add' ? 'adjustment' : 'sale';

    // Create stock movement record
    await this.createStockMovement(lotId, movementType, quantity, reason, userId);

    // Update lot stock if it exists in the lots table
    if (operation === 'add') {
      await this.lotRepository.query(
        'UPDATE lots SET stock = COALESCE(stock, 0) + ? WHERE id = ?',
        [quantity, lotId]
      );
    } else {
      await this.lotRepository.query(
        'UPDATE lots SET stock = GREATEST(COALESCE(stock, 0) - ?, 0) WHERE id = ?',
        [quantity, lotId]
      );
    }

    return { success: true, operation, quantity, lotId };
  }

  async getStockSummary(userId: number): Promise<any> {
    // Total du stock actuel
    const totalStock = await this.lotRepository.query(`
      SELECT COALESCE(SUM(stock), 0) as total
      FROM lots
      WHERE userId = ? AND stock > 0
    `, [userId]);

    // Total récolté
    const totalHarvested = await this.lotRepository.query(`
      SELECT COALESCE(SUM(quantite), 0) as total
      FROM lots
      WHERE userId = ? AND quantite IS NOT NULL
    `, [userId]);

    // Lots avec stock faible (moins de 10% du stock initial)
    const lowStockLots = await this.lotRepository.query(`
      SELECT
        l.id,
        l.nom,
        v.nom as variete,
        l.quantite as quantiteRecoltee,
        l.stock as stockRestant,
        l.productType,
        ROUND((l.stock / NULLIF(l.quantite, 0)) * 100, 1) as pourcentageRestant
      FROM lots l
      INNER JOIN varietes v ON l.varieteId = v.id
      WHERE l.userId = ?
        AND l.quantite > 0
        AND l.stock > 0
        AND (l.stock / l.quantite) < 0.1
      ORDER BY pourcentageRestant ASC
    `, [userId]);

    // Stock par type de produit
    const stockByType = await this.lotRepository.query(`
      SELECT
        productType,
        COALESCE(SUM(stock), 0) as totalStock,
        COUNT(*) as lotsCount
      FROM lots
      WHERE userId = ? AND stock > 0
      GROUP BY productType
    `, [userId]);

    return {
      totalStock: parseFloat(totalStock[0].total) || 0,
      totalHarvested: parseFloat(totalHarvested[0].total) || 0,
      stockPercentage: totalHarvested[0].total > 0
        ? Math.round((totalStock[0].total / totalHarvested[0].total) * 100 * 10) / 10
        : 0,
      lowStockLots: lowStockLots.map(lot => ({
        id: lot.id,
        nom: lot.nom,
        variete: lot.variete,
        quantiteRecoltee: parseFloat(lot.quantiteRecoltee),
        stockRestant: parseFloat(lot.stockRestant),
        productType: lot.productType,
        pourcentageRestant: parseFloat(lot.pourcentageRestant)
      })),
      stockByType: stockByType.map(type => ({
        productType: type.productType,
        totalStock: parseFloat(type.totalStock),
        lotsCount: type.lotsCount
      }))
    };
  }

  async getStockStatistics(userId: number) {
    // Stats des lots de plantes
    const [plantsStats] = await this.lotRepository.query(`
      SELECT
        COALESCE(SUM(CASE WHEN etapeCulture = 'Maturation' AND stock > 0 THEN stock END), 0) as totalStock,
        COALESCE(SUM(CASE WHEN etapeCulture = 'Maturation' AND quantite > 0 THEN quantite END), 0) as totalHarvested,
        COUNT(CASE WHEN etapeCulture = 'Maturation' THEN 1 END) as lotsInMaturation,
        COUNT(CASE WHEN etapeCulture = 'Maturation' AND quantite > 0 AND (stock / quantite) < 0.2 THEN 1 END) as lowStockLots
      FROM lots
      WHERE userId = ?
    `, [userId]);

    // Stats des transformations
    const [transformationsStats] = await this.transformationRepository.query(`
      SELECT
        COALESCE(SUM(CASE WHEN stock > 0 THEN stock END), 0) as totalStock,
        COALESCE(SUM(CASE WHEN quantite_obtenue > 0 THEN quantite_obtenue END), 0) as totalProduced,
        COUNT(*) as totalTransformations,
        COUNT(CASE WHEN stock > 0 AND (stock / quantite_obtenue) < 0.2 THEN 1 END) as lowStockTransformations
      FROM lots_transformation
      WHERE userId = ?
    `, [userId]);

    return {
      totalStock: parseFloat(plantsStats.totalStock || 0) + parseFloat(transformationsStats.totalStock || 0),
      totalHarvested: parseFloat(plantsStats.totalHarvested || 0),
      totalProduced: parseFloat(transformationsStats.totalProduced || 0),
      lotsInMaturation: parseInt(plantsStats.lotsInMaturation || 0),
      totalTransformations: parseInt(transformationsStats.totalTransformations || 0),
      lowStockLots: parseInt(plantsStats.lowStockLots || 0),
      lowStockTransformations: parseInt(transformationsStats.lowStockTransformations || 0)
    };
  }

  async updateStockDirect(lotId: number, updateStockDto: any, userId: number): Promise<any> {
    const lot = await this.lotRepository.findOne({ where: { id: lotId, userId: userId } });

    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (lot.userId !== userId) {
      throw new Error("Vous n'avez pas accès à cette ressource");
    }

    // Vérifier que le nouveau stock ne dépasse pas la quantité récoltée
    if (updateStockDto.newStock > (lot.quantite || 0)) {
      throw new Error("Le stock ne peut pas dépasser la quantité récoltée");
    }

    const oldStock = lot.stock || 0;
    const stockDifference = updateStockDto.newStock - oldStock;

    // Mettre à jour le stock
    await this.lotRepository.query(
      'UPDATE lots SET stock = ? WHERE id = ?',
      [updateStockDto.newStock, lotId]
    );

    // Enregistrer le mouvement de stock si nécessaire
    if (stockDifference !== 0) {
      const reason = updateStockDto.reason || `${updateStockDto.movementType} - Stock mis à jour`;

      await this.createStockMovement(
        lotId,
        updateStockDto.movementType,
        Math.abs(stockDifference),
        reason,
        userId
      );
    }

    return {
      message: "Stock mis à jour avec succès",
      lotId: lotId,
      oldStock: oldStock,
      newStock: updateStockDto.newStock,
      difference: stockDifference,
      movementType: updateStockDto.movementType
    };
  }

  async updateTransformationStock(transformationId: number, operation: 'add' | 'remove', quantity: number, reason?: string, userId?: number) {
    // Vérifier que la transformation appartient à l'utilisateur
    const transformation = await this.transformationRepository.findOne({
      where: { id: transformationId, userId }
    });

    if (!transformation) {
      throw new Error('Transformation non trouvée ou accès refusé');
    }

    const oldStock = parseFloat(String(transformation.stock || 0));
    let newStock: number;

    if (operation === 'add') {
      newStock = oldStock + quantity;
    } else {
      newStock = Math.max(0, oldStock - quantity);
    }

    // Mettre à jour le stock
    await this.transformationRepository.update(transformationId, { stock: newStock });

    // Créer un mouvement de stock
    const movementType = operation === 'add' ? 'adjustment' : 'sale';
    await this.createStockMovement(
      transformationId,
      movementType,
      quantity,
      reason || `${operation === 'add' ? 'Ajout' : 'Retrait'} de stock`,
      userId,
      'transformation',
      transformation.nom,
      null,
      null
    );

    return {
      message: 'Stock de transformation mis à jour avec succès',
      transformationId,
      oldStock,
      newStock,
      difference: newStock - oldStock,
      operation
    };
  }
}
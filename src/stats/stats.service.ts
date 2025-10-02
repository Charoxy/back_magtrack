import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lot } from '../entities/entitie.lots';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,
  ) {}

  async getOverview(userId: number): Promise<any> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Total lots (actifs + terminés)
    const totalLots = await this.lotRepository.query(`
      SELECT COUNT(*) as total FROM lots WHERE userId = ?
    `, [userId]);

    // Plants actifs
    const activePlants = await this.lotRepository.query(`
      SELECT COALESCE(SUM(planteQuantite), 0) as total
      FROM lots
      WHERE userId = ? AND dateFin IS NULL
    `, [userId]);

    // Rendement total (pour les lots terminés avec rendement)
    const totalYield = await this.lotRepository.query(`
      SELECT COALESCE(SUM(quantite), 0) as total
      FROM lots
      WHERE userId = ? AND dateFin IS NOT NULL AND quantite IS NOT NULL
    `, [userId]);

    // Taux de réussite (lots terminés avec succès)
    const successStats = await this.lotRepository.query(`
      SELECT
        COUNT(*) as total_lots,
        SUM(CASE WHEN dateFin IS NOT NULL AND quantite > 0 THEN 1 ELSE 0 END) as successful_lots
      FROM lots
      WHERE userId = ?
    `, [userId]);

    // Croissance mensuelle - lots
    const lotsThisMonth = await this.lotRepository.query(`
      SELECT COUNT(*) as total
      FROM lots
      WHERE userId = ? AND MONTH(createdAt) = ? AND YEAR(createdAt) = ?
    `, [userId, currentMonth, currentYear]);

    const lotsLastMonth = await this.lotRepository.query(`
      SELECT COUNT(*) as total
      FROM lots
      WHERE userId = ? AND MONTH(createdAt) = ? AND YEAR(createdAt) = ?
    `, [userId, lastMonth, lastMonthYear]);

    // Croissance mensuelle - plants
    const plantsThisMonth = await this.lotRepository.query(`
      SELECT COALESCE(SUM(planteQuantite), 0) as total
      FROM lots
      WHERE userId = ? AND MONTH(createdAt) = ? AND YEAR(createdAt) = ?
    `, [userId, currentMonth, currentYear]);

    const plantsLastMonth = await this.lotRepository.query(`
      SELECT COALESCE(SUM(planteQuantite), 0) as total
      FROM lots
      WHERE userId = ? AND MONTH(createdAt) = ? AND YEAR(createdAt) = ?
    `, [userId, lastMonth, lastMonthYear]);

    // Croissance mensuelle - rendement
    const yieldThisMonth = await this.lotRepository.query(`
      SELECT COALESCE(SUM(quantite), 0) as total
      FROM lots
      WHERE userId = ? AND MONTH(dateFin) = ? AND YEAR(dateFin) = ? AND quantite IS NOT NULL
    `, [userId, currentMonth, currentYear]);

    const yieldLastMonth = await this.lotRepository.query(`
      SELECT COALESCE(SUM(quantite), 0) as total
      FROM lots
      WHERE userId = ? AND MONTH(dateFin) = ? AND YEAR(dateFin) = ? AND quantite IS NOT NULL
    `, [userId, lastMonth, lastMonthYear]);

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const successRate = successStats[0].total_lots > 0
      ? Math.round((successStats[0].successful_lots / successStats[0].total_lots) * 100)
      : 0;

    return {
      total_lots: totalLots[0].total,
      active_plants: activePlants[0].total,
      total_yield_kg: parseFloat(totalYield[0].total) || 0,
      success_rate: successRate,
      monthly_growth: {
        lots: calculateGrowth(lotsThisMonth[0].total, lotsLastMonth[0].total),
        plants: calculateGrowth(plantsThisMonth[0].total, plantsLastMonth[0].total),
        yield: calculateGrowth(yieldThisMonth[0].total, yieldLastMonth[0].total),
        success: 0 // TODO: Calculer la variation du taux de succès
      }
    };
  }

  async getStageDistribution(userId: number): Promise<any> {
    const stageStats = await this.lotRepository.query(`
      SELECT
        etapeCulture as stage,
        COUNT(*) as count
      FROM lots
      WHERE userId = ? AND dateFin IS NULL
      GROUP BY etapeCulture
      ORDER BY
        CASE etapeCulture
          WHEN 'semi' THEN 1
          WHEN 'croissance' THEN 2
          WHEN 'floraison' THEN 3
          WHEN 'maturation' THEN 4
          WHEN 'sechage' THEN 5
          ELSE 6
        END
    `, [userId]);

    const stageLabels = {
      'semi': 'Semi',
      'croissance': 'Croissance',
      'floraison': 'Floraison',
      'maturation': 'Maturation',
      'sechage': 'Séchage'
    };

    const totalActiveLots = stageStats.reduce((sum, stage) => sum + stage.count, 0);

    const stages = stageStats.map(stage => ({
      stage: stage.stage,
      label: stageLabels[stage.stage] || stage.stage,
      count: stage.count,
      percentage: totalActiveLots > 0 ? Math.round((stage.count / totalActiveLots) * 100) : 0
    }));

    return {
      stages,
      total_active_lots: totalActiveLots
    };
  }

  async getMonthlyTrends(userId: number): Promise<any> {
    const trends = await this.lotRepository.query(`
      SELECT
        DATE_FORMAT(months.month_date, '%Y-%m') as month,
        DATE_FORMAT(months.month_date, '%b') as month_label,
        COALESCE(created.lots_created, 0) as lots_created,
        COALESCE(harvested.plants_harvested, 0) as plants_harvested,
        COALESCE(harvested.yield_kg, 0) as yield_kg
      FROM (
        SELECT DATE_SUB(CURDATE(), INTERVAL seq MONTH) as month_date
        FROM (SELECT 0 as seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) months
      ) months
      LEFT JOIN (
        SELECT
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as lots_created
        FROM lots
        WHERE userId = ?
          AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ) created ON DATE_FORMAT(months.month_date, '%Y-%m') = created.month
      LEFT JOIN (
        SELECT
          DATE_FORMAT(dateFin, '%Y-%m') as month,
          SUM(planteQuantite) as plants_harvested,
          SUM(COALESCE(quantite, 0)) as yield_kg
        FROM lots
        WHERE userId = ?
          AND dateFin IS NOT NULL
          AND dateFin >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(dateFin, '%Y-%m')
      ) harvested ON DATE_FORMAT(months.month_date, '%Y-%m') = harvested.month
      ORDER BY months.month_date DESC
      LIMIT 6
    `, [userId, userId]);

    return {
      months: trends.reverse().map(trend => ({
        month: trend.month,
        month_label: trend.month_label,
        lots_created: trend.lots_created,
        plants_harvested: trend.plants_harvested,
        yield_kg: parseFloat(trend.yield_kg) || 0
      }))
    };
  }

  async getVarietyPerformance(userId: number): Promise<any> {
    const varietyStats = await this.lotRepository.query(`
      SELECT
        v.id as variety_id,
        v.nom as variety_name,
        COUNT(l.id) as total_lots,
        SUM(l.planteQuantite) as total_plants,
        COALESCE(AVG(CASE WHEN l.dateFin IS NOT NULL AND l.quantite > 0 THEN l.quantite / l.planteQuantite END), 0) as avg_yield_per_plant,
        ROUND(
          (SUM(CASE WHEN l.dateFin IS NOT NULL AND l.quantite > 0 THEN 1 ELSE 0 END) / COUNT(l.id)) * 100
        ) as success_rate,
        COALESCE(SUM(CASE WHEN l.dateFin IS NOT NULL THEN l.quantite ELSE 0 END), 0) as total_yield_kg
      FROM varietes v
      INNER JOIN lots l ON l.varieteId = v.id
      WHERE l.userId = ?
      GROUP BY v.id, v.nom
      HAVING total_lots > 0
      ORDER BY total_yield_kg DESC
    `, [userId]);

    return {
      varieties: varietyStats.map(variety => ({
        variety_id: variety.variety_id,
        variety_name: variety.variety_name,
        total_lots: variety.total_lots,
        total_plants: variety.total_plants,
        avg_yield_per_plant: parseFloat(variety.avg_yield_per_plant) || 0,
        success_rate: variety.success_rate || 0,
        total_yield_kg: parseFloat(variety.total_yield_kg) || 0
      }))
    };
  }

  async getEnvironmentPerformance(userId: number): Promise<any> {
    const envStats = await this.lotRepository.query(`
      SELECT
        e.culture_type as environment_type,
        CASE e.culture_type
          WHEN 'indoor' THEN 'Indoor'
          WHEN 'outdoor' THEN 'Outdoor'
          ELSE 'Serre'
        END as environment_label,
        COUNT(DISTINCT l.id) as lots_count,
        ROUND(AVG(CASE WHEN l.dateFin IS NOT NULL THEN DATEDIFF(l.dateFin, l.dateDebut) END)) as avg_duration_days,
        ROUND(
          (SUM(CASE WHEN l.dateFin IS NOT NULL AND l.quantite > 0 THEN 1 ELSE 0 END) / COUNT(l.id)) * 100
        ) as success_rate,
        COALESCE(AVG(CASE WHEN l.dateFin IS NOT NULL THEN l.quantite END), 0) as avg_yield_per_lot
      FROM environnements e
      INNER JOIN environnements_lots el ON el.environnementId = e.id
      INNER JOIN lots l ON l.id = el.lotId
      WHERE l.userId = ?
      GROUP BY e.culture_type
      HAVING lots_count > 0
      ORDER BY lots_count DESC
    `, [userId]);

    return {
      environments: envStats.map(env => ({
        environment_type: env.environment_type,
        environment_label: env.environment_label,
        lots_count: env.lots_count,
        avg_duration_days: env.avg_duration_days || 0,
        success_rate: env.success_rate || 0,
        avg_yield_per_lot: parseFloat(env.avg_yield_per_lot) || 0
      }))
    };
  }
}
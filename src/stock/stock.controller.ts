import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { StockService } from "./stock.service";
import { StockMovementsQueryDto } from "../dto/stock-movements-query.dto";
import { StockMovementDto } from "../dto/stock-movement.dto";
import { UpdateStockDto } from "../dto/update-stock.dto";

@UseGuards(AuthGuard)
@Controller('stock')
export class StockController {

  constructor(private readonly stockService: StockService) {}

  @Get('movements')
  getStockMovements(@Request() req, @Query() query: StockMovementsQueryDto) {
    const { page, limit, days, lotId, lotType, transformationId } = query;

    // If page or limit are provided, use paginated response
    if (page !== undefined || limit !== undefined) {
      return this.stockService.getStockMovementsPaginated(
        req.user.sub,
        page || 1,
        limit || 10,
        days,
        lotId,
        lotType,
        transformationId
      );
    }

    // Otherwise, use the legacy format
    const daysNumber = days || 30;
    return this.stockService.getStockMovements(req.user.sub, daysNumber, lotId);
  }

  @Post('update/:lotId')
  updateStock(
    @Request() req,
    @Param('lotId') lotId: number,
    @Body() stockMovement: StockMovementDto
  ) {
    return this.stockService.updateStock(
      lotId,
      stockMovement.operation,
      stockMovement.quantity,
      stockMovement.reason,
      req.user.sub
    );
  }

  @Put('direct/:lotId')
  updateStockDirect(
    @Request() req,
    @Param('lotId') lotId: number,
    @Body() updateStockDto: UpdateStockDto
  ) {
    return this.stockService.updateStockDirect(lotId, updateStockDto, req.user.sub);
  }

  @Get('summary')
  getStockSummary(@Request() req) {
    return this.stockService.getStockSummary(req.user.sub);
  }

  @Get('statistics')
  getStockStatistics(@Request() req) {
    return this.stockService.getStockStatistics(req.user.sub);
  }

  @Post('update-transformation/:transformationId')
  updateTransformationStock(
    @Request() req,
    @Param('transformationId') transformationId: number,
    @Body() stockMovement: StockMovementDto
  ) {
    return this.stockService.updateTransformationStock(
      transformationId,
      stockMovement.operation,
      stockMovement.quantity,
      stockMovement.reason,
      req.user.sub
    );
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TransformationService } from './transformation.service';
import { CreateTransformationLotDto } from '../dto/create-transformation-lot.dto';
import { UpdateTransformationLotDto } from '../dto/update-transformation-lot.dto';
import { ShareTransformationLotDto } from '../dto/share-transformation-lot.dto';
import { TransformationLotsQueryDto } from '../dto/transformation-lots-query.dto';

@Controller('lots/transformation')
export class TransformationController {
  constructor(private readonly transformationService: TransformationService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Request() req, @Body() dto: CreateTransformationLotDto) {
    return this.transformationService.create(dto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req, @Query() query: TransformationLotsQueryDto) {
    return this.transformationService.findAll(
      req.user.sub,
      query.page || 1,
      query.limit || 20
    );
  }

  @UseGuards(AuthGuard)
  @Get('available')
  getAvailableLots(@Request() req, @Query('type') type?: string) {
    return this.transformationService.getAvailableLots(req.user.sub, type);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: number) {
    return this.transformationService.findOne(id, req.user.sub);
  }

  @Get('public/:uuid')
  findByUuid(@Param('uuid') uuid: string) {
    return this.transformationService.findByUuid(uuid);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Request() req, @Param('id') id: number, @Body() dto: UpdateTransformationLotDto) {
    return this.transformationService.update(id, dto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put(':id/share')
  updateShare(@Request() req, @Param('id') id: number, @Body() dto: ShareTransformationLotDto) {
    return this.transformationService.updateShare(id, dto.is_public, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: number) {
    return this.transformationService.remove(id, req.user.sub);
  }
}
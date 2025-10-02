import { Controller, Get, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {


    constructor(
        private readonly publicService: PublicService,
    ) {}

    @Get('lots/:id')
    async getPublicLots(@Query('id') id: string) {
        return this.publicService.getPublicLots(id);
    }


    @Get('conditions/:id')
    async getMoyenneConditions(@Query('id') id: string) {
        return this.publicService.getMoyenneConditions(id);
    }

    @Get('lots/:id/stage-start-dates')
    async getStageStartDates(@Query('id') id: number) {
        return this.publicService.getStageStartDates(id);
    }


}

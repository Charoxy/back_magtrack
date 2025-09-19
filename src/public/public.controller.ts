import { Controller, Get, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {


    constructor(
        private readonly publicService: PublicService,
    ) {}


    @Get('conditions/:id')
    async getMoyenneConditions(@Query('id') id: string) {
        return this.publicService.getMoyenneConditions(id);
    }


}

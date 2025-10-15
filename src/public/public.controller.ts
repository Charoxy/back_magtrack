import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public (sans authentification)')
@Controller('public')
export class PublicController {


    constructor(
        private readonly publicService: PublicService,
    ) {}

    @Get('lots/:id')
    @ApiOperation({ summary: 'Récupérer les informations publiques d\'un lot partagé' })
    @ApiQuery({ name: 'id', description: 'UUID du lot partagé' })
    @ApiResponse({
        status: 200,
        description: 'Informations publiques du lot',
        schema: {
            example: {
                name: 'Purple Haze #1',
                id: 1,
                environnements: [
                    {
                        id: 1,
                        lotId: 1,
                        environnementId: 1,
                        etape: 'culture',
                        date_entree: '2024-01-15',
                        date_sortie: null,
                        environnement: {
                            id: 1,
                            nom: 'Serre A - Indoor',
                            type: 'culture',
                            localisation: 'Bâtiment Nord',
                            surface_m2: '50',
                            culture_type: 'Hydroponie'
                        }
                    }
                ],
                variete: {
                    id: 1,
                    nom: 'Purple Haze',
                    type: 'Indica',
                    indica: 80,
                    sativa: 20,
                    thc: 18.5,
                    cbd: 0.5
                },
                date_debut: '2024-01-15',
                date_fin: null,
                culture_type: 'Hydroponie',
                substrat: 'coco'
            }
        }
    })
    async getPublicLots(@Query('id') id: string) {
        return this.publicService.getPublicLots(id);
    }


    @Get('conditions/:id')
    @ApiOperation({ summary: 'Récupérer les conditions moyennes par étape pour un lot partagé' })
    @ApiQuery({ name: 'id', description: 'UUID du lot partagé' })
    @ApiResponse({
        status: 200,
        description: 'Conditions moyennes par étape',
        schema: {
            example: {
                Croissance: { avg_temp: 24.5, avg_humidity: 65.0 },
                Floraison: { avg_temp: 22.0, avg_humidity: 55.0 }
            }
        }
    })
    async getMoyenneConditions(@Query('id') id: string) {
        return this.publicService.getMoyenneConditions(id);
    }

    @Get('lots/:id/stage-start-dates')
    @ApiOperation({ summary: 'Récupérer les dates de début de chaque étape pour un lot partagé' })
    @ApiQuery({ name: 'id', description: 'ID du lot partagé' })
    @ApiResponse({ status: 200, description: 'Dates de début par étape' })
    async getStageStartDates(@Query('id') id: number) {
        return this.publicService.getStageStartDates(id);
    }


}

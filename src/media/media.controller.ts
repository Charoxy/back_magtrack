import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseIntPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { MediaService } from './media.service';
import { CreateMediaDto } from '../dto/create-media.dto';
import { UpdateMediaDto } from '../dto/update-media.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Médias')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un média (photo ou analyse PDF) à un lot' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['photo', 'analyse'], example: 'photo' },
        nom: { type: 'string', example: 'Photo récolte lot #1' },
        lotId: { type: 'number', example: 1 },
        description: { type: 'string', example: 'Belle photo de la récolte', nullable: true },
        file: { type: 'string', format: 'binary' }
      },
      required: ['type', 'nom', 'lotId', 'file']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Média créé avec succès',
    schema: {
      example: {
        id: 1,
        type: 'photo',
        nom: 'Photo récolte lot #1',
        description: 'Belle photo de la récolte',
        mimeType: 'image/jpeg',
        taille: 245678,
        lotId: 1,
        dateCreation: '2024-01-20T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Type de fichier invalide ou analyse déjà existante' })
  @ApiResponse({ status: 404, description: 'Lot non trouvé' })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Request() req,
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const media = await this.mediaService.create(createMediaDto, file, req.user.sub);
    // Ne pas retourner le buffer data dans la réponse
    const { data, ...mediaWithoutData } = media;
    return mediaWithoutData;
  }

  @Get('lot/:lotId')
  @ApiOperation({ summary: 'Récupérer tous les médias d\'un lot' })
  @ApiParam({ name: 'lotId', description: 'ID du lot' })
  @ApiResponse({
    status: 200,
    description: 'Liste des médias',
    schema: {
      example: [
        {
          id: 1,
          type: 'photo',
          nom: 'Photo récolte',
          description: 'Belle photo',
          mimeType: 'image/jpeg',
          taille: 245678,
          lotId: 1,
          dateCreation: '2024-01-20T10:00:00Z'
        },
        {
          id: 2,
          type: 'analyse',
          nom: 'Analyse cannabinoïdes',
          mimeType: 'application/pdf',
          taille: 156789,
          lotId: 1,
          dateCreation: '2024-01-21T14:30:00Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Lot non trouvé' })
  findAllByLot(@Request() req, @Param('lotId', ParseIntPipe) lotId: number) {
    return this.mediaService.findAllByLot(lotId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Télécharger un fichier média' })
  @ApiParam({ name: 'id', description: 'ID du média' })
  @ApiResponse({ status: 200, description: 'Fichier média' })
  @ApiResponse({ status: 404, description: 'Média non trouvé' })
  async getFile(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const { data, mimeType, nom } = await this.mediaService.getMediaFile(id, req.user.sub);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${nom}"`,
      'Content-Length': data.length,
    });

    res.send(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un média (nom, description et/ou fichier)' })
  @ApiParam({ name: 'id', description: 'ID du média' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', example: 'Nouveau nom', nullable: true },
        description: { type: 'string', example: 'Nouvelle description', nullable: true },
        file: { type: 'string', format: 'binary', nullable: true }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Média modifié avec succès',
    schema: {
      example: {
        id: 1,
        type: 'photo',
        nom: 'Nouveau nom',
        description: 'Nouvelle description',
        mimeType: 'image/jpeg',
        taille: 245678,
        lotId: 1,
        dateCreation: '2024-01-20T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Média non trouvé' })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMediaDto: UpdateMediaDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const media = await this.mediaService.update(id, updateMediaDto, file, req.user.sub);
    const { data, ...mediaWithoutData } = media;
    return mediaWithoutData;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un média' })
  @ApiParam({ name: 'id', description: 'ID du média' })
  @ApiResponse({ status: 200, description: 'Média supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Média non trouvé' })
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.mediaService.remove(id, req.user.sub);
    return { message: 'Média supprimé avec succès' };
  }
}

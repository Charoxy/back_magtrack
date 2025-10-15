import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../entities/entitie.media';
import { Lot } from '../entities/entitie.lots';
import { CreateMediaDto } from '../dto/create-media.dto';
import { UpdateMediaDto } from '../dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,
  ) {}

  async create(createMediaDto: CreateMediaDto, file: Express.Multer.File, userId: number): Promise<Media> {
    // Vérifier que le lot appartient à l'utilisateur
    const lot = await this.lotRepository.findOne({
      where: { id: createMediaDto.lotId, userId: userId }
    });

    if (!lot) {
      throw new NotFoundException('Lot non trouvé ou accès refusé');
    }

    // Vérifier le type de fichier selon le type de média
    if (createMediaDto.type === 'photo') {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Le fichier doit être une image');
      }
    } else if (createMediaDto.type === 'analyse') {
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Le fichier doit être un PDF');
      }

      // Vérifier s'il existe déjà une analyse pour ce lot
      const existingAnalyse = await this.mediaRepository.findOne({
        where: { lotId: createMediaDto.lotId, type: 'analyse' }
      });

      if (existingAnalyse) {
        throw new BadRequestException('Ce lot a déjà une analyse. Utilisez la modification pour la remplacer.');
      }
    }

    const media = this.mediaRepository.create({
      type: createMediaDto.type,
      nom: createMediaDto.nom,
      description: createMediaDto.description,
      lotId: createMediaDto.lotId,
      data: file.buffer,
      mimeType: file.mimetype,
      taille: file.size,
    });

    return await this.mediaRepository.save(media);
  }

  async findAllByLot(lotId: number, userId: number): Promise<Media[]> {
    // Vérifier que le lot appartient à l'utilisateur
    const lot = await this.lotRepository.findOne({
      where: { id: lotId, userId: userId }
    });

    if (!lot) {
      throw new NotFoundException('Lot non trouvé ou accès refusé');
    }

    return await this.mediaRepository.find({
      where: { lotId: lotId },
      select: ['id', 'type', 'nom', 'description', 'mimeType', 'taille', 'dateCreation', 'lotId'],
      order: { dateCreation: 'DESC' }
    });
  }

  async findOne(id: number, userId: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['lot']
    });

    if (!media) {
      throw new NotFoundException('Média non trouvé');
    }

    // Vérifier que le lot appartient à l'utilisateur
    if (media.lot.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return media;
  }

  async update(id: number, updateMediaDto: UpdateMediaDto, file: Express.Multer.File | undefined, userId: number): Promise<Media> {
    const media = await this.findOne(id, userId);

    if (updateMediaDto.nom) {
      media.nom = updateMediaDto.nom;
    }

    if (updateMediaDto.description !== undefined) {
      media.description = updateMediaDto.description;
    }

    // Si un nouveau fichier est fourni
    if (file) {
      // Vérifier le type de fichier
      if (media.type === 'photo' && !file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Le fichier doit être une image');
      }
      if (media.type === 'analyse' && file.mimetype !== 'application/pdf') {
        throw new BadRequestException('Le fichier doit être un PDF');
      }

      media.data = file.buffer;
      media.mimeType = file.mimetype;
      media.taille = file.size;
    }

    return await this.mediaRepository.save(media);
  }

  async remove(id: number, userId: number): Promise<void> {
    const media = await this.findOne(id, userId);
    await this.mediaRepository.remove(media);
  }

  async getMediaFile(id: number, userId: number): Promise<{ data: Buffer, mimeType: string, nom: string }> {
    const media = await this.findOne(id, userId);

    return {
      data: media.data,
      mimeType: media.mimeType,
      nom: media.nom
    };
  }
}

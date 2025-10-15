import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { Media } from '../entities/entitie.media';
import { Lot } from '../entities/entitie.lots';

@Module({
  imports: [TypeOrmModule.forFeature([Media, Lot])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService]
})
export class MediaModule {}

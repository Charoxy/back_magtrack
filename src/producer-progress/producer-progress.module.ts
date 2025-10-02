import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProducerProgressController } from './producer-progress.controller';
import { ProducerProgressService } from './producer-progress.service';
import { ProducerProgress } from '../entities/entitie.producer-progress';

@Module({
  imports: [TypeOrmModule.forFeature([ProducerProgress])],
  controllers: [ProducerProgressController],
  providers: [ProducerProgressService],
  exports: [ProducerProgressService]
})
export class ProducerProgressModule {}
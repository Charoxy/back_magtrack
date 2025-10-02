import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ProducerProgressService } from './producer-progress.service';
import { AuthGuard } from '../auth/auth.guard';
import { SaveProducerProgressDto } from '../dto/save-producer-progress.dto';

@UseGuards(AuthGuard)
@Controller('producer-progress')
export class ProducerProgressController {
  constructor(private readonly producerProgressService: ProducerProgressService) {}

  @Get()
  async getProgress(@Request() req) {
    return this.producerProgressService.getProgress(req.user.sub);
  }

  @Post('save')
  async saveProgress(@Request() req, @Body() progressData: SaveProducerProgressDto) {
    return this.producerProgressService.saveProgress(req.user.sub, progressData);
  }
}
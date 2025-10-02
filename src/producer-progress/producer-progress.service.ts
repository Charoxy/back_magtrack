import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProducerProgress } from '../entities/entitie.producer-progress';
import { SaveProducerProgressDto } from '../dto/save-producer-progress.dto';

@Injectable()
export class ProducerProgressService {
  constructor(
    @InjectRepository(ProducerProgress)
    private readonly producerProgressRepository: Repository<ProducerProgress>,
  ) {}

  async getProgress(userId: number): Promise<any> {
    const progress = await this.producerProgressRepository.findOne({
      where: { userId: userId }
    });

    if (!progress) {
      // Si aucune progression n'existe, retourner des arrays vides
      return {
        completedTasks: [],
        completedSubtasks: []
      };
    }

    return {
      completedTasks: progress.completedTasks || [],
      completedSubtasks: progress.completedSubtasks || []
    };
  }

  async saveProgress(userId: number, progressData: SaveProducerProgressDto): Promise<any> {
    // Vérifier si une progression existe déjà pour cet utilisateur
    let progress = await this.producerProgressRepository.findOne({
      where: { userId: userId }
    });

    if (progress) {
      // Mettre à jour la progression existante
      progress.completedTasks = progressData.completedTasks;
      progress.completedSubtasks = progressData.completedSubtasks;
      await this.producerProgressRepository.save(progress);
    } else {
      // Créer une nouvelle progression
      progress = new ProducerProgress();
      progress.userId = userId;
      progress.completedTasks = progressData.completedTasks;
      progress.completedSubtasks = progressData.completedSubtasks;
      await this.producerProgressRepository.save(progress);
    }

    return {
      success: true,
      message: "Progression sauvegardée"
    };
  }

  // Méthode optionnelle pour valider les IDs des tâches
  private validateTaskIds(taskIds: string[], subtaskIds: string[]): boolean {
    // Liste des tâches principales valides
    const validTasks = [
      'formation',
      'entreprise-creation',
      'reglementation',
      'production',
      'commercialisation'
    ];

    // Liste des sous-tâches valides
    const validSubtasks = [
      'semis-formation',
      'statut-agricole',
      'creation-entreprise',
      'autorisation-culture',
      'formation-cbd',
      'plan-production',
      'vente-formation'
    ];

    // Vérifier que tous les IDs de tâches sont valides
    const invalidTasks = taskIds.filter(id => !validTasks.includes(id));
    const invalidSubtasks = subtaskIds.filter(id => !validSubtasks.includes(id));

    return invalidTasks.length === 0 && invalidSubtasks.length === 0;
  }
}
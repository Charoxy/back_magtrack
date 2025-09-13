import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Nutriments } from "../entities/entitie.nutriments";
import { Repository } from "typeorm";
import { CreateNutrimentsDto } from "../dto/nutrimentsmake.dto";

@Injectable()
export class NutrimentsService {

  constructor(
    @InjectRepository(Nutriments)
    private readonly nutrimentsRepository: Repository<Nutriments>,
  ) {}

  async getAllNutriments(): Promise<Nutriments[]> {
    return this.nutrimentsRepository.find();
  }

  async getNutrimentById(id: number): Promise<Nutriments> {
    return this.nutrimentsRepository.findOne({where: {id: id}});
  }

  async createNutriment(nutriment: CreateNutrimentsDto): Promise<Nutriments> {

    console.log(nutriment);

    const newNutriment = new Nutriments();
    newNutriment.nom = nutriment.nom;
    newNutriment.marque = nutriment.marque;
    newNutriment.type = nutriment.type;
    newNutriment.description = nutriment.description;
    newNutriment.isPublic = false;

    return this.nutrimentsRepository.save(newNutriment);
  }

}

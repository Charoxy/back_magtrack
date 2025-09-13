import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Variete } from "../entities/entitie.variete";
import { Repository, UpdateResult } from "typeorm";
import { CreateVarieteDto } from "../dto/varietemake.dto";

@Injectable()
export class VarieteService {

  constructor(
    @InjectRepository(Variete)
    private readonly varieteRepository: Repository<Variete>,
  ) { }

  async getAllVariete(): Promise<Variete[]> {
    return await this.varieteRepository.find();
  }

  async getVarieteById(id: number): Promise<Variete> {
    return await this.varieteRepository.findOne({ where: { id: id } });
  }

  async createVariete(variete: CreateVarieteDto): Promise<Variete> {

    let newVariete = new Variete();
    newVariete.nom = variete.nom;
    newVariete.description = variete.description;
    newVariete.origine = variete.origine;
    newVariete.breeder = variete.breeder;
    newVariete.type = variete.type;
    newVariete.tauxTHC = variete.tauxTHC;
    newVariete.tauxCBD = variete.tauxCBD;

    return await this.varieteRepository.save(newVariete);
  }

  async updateVariete(variete: Variete): Promise<UpdateResult> {
    return await this.varieteRepository.update(variete.id, variete);
  }

  async deleteVariete(id: number): Promise<void> {
    await this.varieteRepository.delete({ id: id });
  }
}

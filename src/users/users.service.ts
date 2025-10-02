import { Injectable } from '@nestjs/common';
import { User } from "../entities/entitie.user";
import { Repository } from 'typeorm';
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "../dto/usermake.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id: id } });
  }

  async finByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  async createUser(user: CreateUserDto): Promise<User> {

    let newUser = new User();
    newUser.email = user.email;
    newUser.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
    newUser.nom = user.nom;
    newUser.organisation = user.organisation;

    // Si isproducteur est défini, on l'assigne, sinon par défaut producteur
    if (user.isproducteur !== undefined && !user.isproducteur) {
      newUser.role = 'technicien';
    } else {
      newUser.role = 'non_producteur';
    }

    return await this.userRepository.save(newUser);
  }

  async getProfile(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'nom', 'organisation', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }


}

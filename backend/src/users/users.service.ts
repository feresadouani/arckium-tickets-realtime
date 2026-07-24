import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { MongoRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(Users) private readonly userRepository:MongoRepository<Users>){}

     async findAll(): Promise<Users[]> {
    try {
      const users = await this.userRepository.find();
      if (users.length === 0) {
        throw new NotFoundException("Aucun utilisateur trouvé")
      }
      return users
    }
    catch (error) {
      console.error(error);
      throw new InternalServerErrorException("Erreur");
    }
  }
  async updatePassword(id: string, newPassword: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("Utilisateur non trouvé");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await this.userRepository.save(user);
      return { message: "Mot de passe mis à jour avec succès" };
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de la mise à jour du mot de passe");
    }
  }
  async disableUser(id: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("Utilisateur non trouvé");
      }
      user.active = false;
      await this.userRepository.save(user);
      return { message: "Utilisateur désactivé avec succès" };
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de la désactivation de l'utilisateur");
    }
  }
  async enableUser(id: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("Utilisateur non trouvé");
      }
      user.active = true;
      await this.userRepository.save(user);
      return { message: "Utilisateur activé avec succès" };
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de l'activation de l'utilisateur");
    }
  }
  async deleteUser(id: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("Utilisateur non trouvé");
      }
      await this.userRepository.delete({ _id: new ObjectId(id) });
      return { message: "Utilisateur supprimé avec succès" };
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de la suppression de l'utilisateur");
    }
  }
  async updateProfile(id: string, profile: Partial<Users>) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("Utilisateur non trouvé");
      }
      Object.assign(user, profile);
      await this.userRepository.save(user);
      return { message: "Profil mis à jour avec succès" };
    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de la mise à jour du profil");
    }
  }


  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { _id: new ObjectId(id) } });
  }

  async create(user: Partial<Users>): Promise<Users> {
    const created = this.userRepository.create(user);
    return this.userRepository.save(created);
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Equipment } from './equipments.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: MongoRepository<Equipment>,
  ) {}

  async findAll(): Promise<Equipment[]> {
    try {
      const items = await this.equipmentRepository.find();
      return items.filter((e) => e.active !== false);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error fetching equipment');
    }
  }

  async create(dto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create({
      nom: dto.nom.trim(),
      localisation: dto.localisation.trim(),
      reference: dto.reference?.trim(),
      active: true,
      date_creation: new Date(),
    });
    return this.equipmentRepository.save(equipment);
  }

  async findById(id: string): Promise<Equipment | null> {
    return this.equipmentRepository.findOneBy({
      _id: new ObjectId(id),
      active: true,
    });
  }
}

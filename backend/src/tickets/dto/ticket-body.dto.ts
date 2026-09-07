import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { statut, urgence } from '../tickets.entity';

export class TicketBodyDto {
  @IsOptional()
  @IsString()
  numero_ticket?: string;

  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(statut)
  status?: statut;

  @IsOptional()
  @IsEnum(urgence)
  urgence?: urgence;

  @IsOptional()
  @IsString()
  technicien_id?: string;

  @IsOptional()
  @IsString()
  equipment_id?: string;

  @IsOptional()
  @IsString()
  created_by?: string;

  @IsOptional()
  date_creation?: Date;

  @IsOptional()
  date_resolution?: Date;

  @IsOptional()
  date_assignation?: Date;
}

export class CreateTicketDto extends TicketBodyDto {
  @IsString()
  @IsNotEmpty()
  declare titre: string;

  @IsString()
  @IsNotEmpty()
  declare description: string;
}

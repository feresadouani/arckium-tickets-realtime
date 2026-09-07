import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  nom!: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  localisation!: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

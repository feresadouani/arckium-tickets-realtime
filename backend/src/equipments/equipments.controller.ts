import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UserRole } from 'src/users/users.entity';
import { canCreateUsers } from 'src/common/roles.util';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Get('all')
  async getAll() {
    return this.equipmentsService.findAll();
  }

  @Post('add')
  async create(
    @Body() dto: CreateEquipmentDto,
    @Req() req: { user?: { role?: UserRole } },
  ) {
    const role = req.user?.role;
    if (!role || !canCreateUsers(role)) {
      throw new ForbiddenException('Only admin and manager can add equipment');
    }
    return this.equipmentsService.create(dto);
  }
}

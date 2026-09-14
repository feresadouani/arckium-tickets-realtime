import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { canManageUsers } from 'src/common/roles.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Post('/add')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: { user?: { role?: UserRole } },
  ) {
    const creatorRole = req.user?.role;
    if (!creatorRole || !canManageUsers(creatorRole)) {
      throw new ForbiddenException('Only an administrator can manage users');
    }
    return this.usersService.createUser(createUserDto, creatorRole);
  }

  @Patch('/updatepassword/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
    @Req() req: { user?: { role?: UserRole; sub?: string } },
  ) {
    const isAdmin = canManageUsers(req.user?.role);
    const isSelf = req.user?.sub === id;
    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('Permission denied');
    }
    return this.usersService.updatePassword(id, newPassword);
  }

  @Patch('/disable/:id')
  async disableUser(
    @Param('id') id: string,
    @Req() req: { user?: { role?: UserRole; sub?: string } },
  ) {
    if (!canManageUsers(req.user?.role)) {
      throw new ForbiddenException('Only an administrator can manage users');
    }
    if (req.user?.sub === id) {
      throw new ForbiddenException('You cannot disable your own account');
    }
    return this.usersService.disableUser(id);
  }

  @Delete('/delete/:id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: { user?: { role?: UserRole; sub?: string } },
  ) {
    if (!canManageUsers(req.user?.role)) {
      throw new ForbiddenException('Only an administrator can manage users');
    }
    if (req.user?.sub === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    return this.usersService.deleteUser(id);
  }

  @Patch('/enable/:id')
  async enableUser(
    @Param('id') id: string,
    @Req() req: { user?: { role?: UserRole } },
  ) {
    if (!canManageUsers(req.user?.role)) {
      throw new ForbiddenException('Only an administrator can manage users');
    }
    return this.usersService.enableUser(id);
  }

  @Patch('/update/:id')
  async updateProfile(
    @Param('id') id: string,
    @Body() profile: UpdateUserProfileDto,
    @Req() req: { user?: { role?: UserRole; sub?: string } },
  ) {
    const isAdmin = canManageUsers(req.user?.role);
    const isSelf = req.user?.sub === id;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('Permission denied');
    }

    // Seul un admin peut changer le rôle
    if (profile.role !== undefined && !isAdmin) {
      throw new ForbiddenException('Only an administrator can change roles');
    }

    // Utilisateur normal : prénom / nom uniquement
    const safeProfile = isAdmin
      ? profile
      : { firstname: profile.firstname, lastname: profile.lastname };

    return this.usersService.updateProfile(id, safeProfile);
  }
}

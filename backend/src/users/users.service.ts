import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users, UserRole } from './users.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { hashPassword, isPasswordHashed, validatePasswordStrength } from 'src/common/password.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { canAssignRole } from 'src/common/roles.util';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(@InjectRepository(Users) private readonly userRepository:MongoRepository<Users>){}

    async onModuleInit() {
        await this.migratePlainTextPasswords();
    }

    private async migratePlainTextPasswords(): Promise<void> {
        try {
            const users = await this.userRepository.find();
            for (const user of users) {
                if (user.password && !isPasswordHashed(user.password)) {
                    user.password = await hashPassword(user.password);
                    await this.userRepository.save(user);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la migration des mots de passe:', error);
        }
    }

    async hashAndSavePassword(user: Users, plainPassword: string): Promise<void> {
        user.password = await hashPassword(plainPassword);
        await this.userRepository.save(user);
    }

  async countUsers(): Promise<number> {
    return this.userRepository.count();
  }

  async findAll(): Promise<Partial<Users>[]> {
    try {
      const users = await this.userRepository.find();
      return users.map(({ password, ...safe }) => safe);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Erreur');
    }
  }
  async updatePassword(id: string, newPassword: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("User not found");
      }
      const validation = validatePasswordStrength(newPassword);
      if (!validation.valid) {
        throw new BadRequestException(validation.errors);
      }
      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;
      await this.userRepository.save(user);
      return { message: "Password updated successfully" };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Error updating password");
    }
  }
  async disableUser(id: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("User not found");
      }
      user.active = false;
      await this.userRepository.save(user);
      return { message: "User disabled successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Error disabling user");
    }
  }
  async enableUser(id: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("User not found");
      }
      user.active = true;
      await this.userRepository.save(user);
      return { message: "User enabled successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Error enabling user");
    }
  }
  async deleteUser(id: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("User not found");
      }
      await this.userRepository.delete({ _id: new ObjectId(id) });
      return { message: "User deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Error deleting user");
    }
  }
  async updateProfile(id: string, profile: UpdateUserProfileDto) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException("User not found");
      }
      Object.assign(user, profile);
      if (user.password && !isPasswordHashed(user.password)) {
        user.password = await hashPassword(user.password);
      }
      await this.userRepository.save(user);
      return { message: "Profile updated successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Error updating profile");
    }
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  async findById(id: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { _id: new ObjectId(id) } });
  }

  async create(user: Partial<Users>): Promise<Users> {
    if (user.password && !isPasswordHashed(user.password)) {
      const validation = validatePasswordStrength(user.password);
      if (!validation.valid) {
        throw new BadRequestException(validation.errors);
      }
      user.password = await hashPassword(user.password);
    }
    const created = this.userRepository.create(user);
    return this.userRepository.save(created);
  }

  async createUser(
    dto: CreateUserDto,
    creatorRole: UserRole,
  ): Promise<{ message: string; userId: string }> {
    if (!canAssignRole(creatorRole, dto.role)) {
      throw new ForbiddenException(
        'Only an administrator can create users with this role',
      );
    }

    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account already exists with this email.');
    }

    const user = await this.create({
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email.toLowerCase(),
      password: dto.password,
      role: dto.role,
      active: true,
    });

    return {
      message: 'User created successfully',
      userId: String(user._id),
    };
  }
}

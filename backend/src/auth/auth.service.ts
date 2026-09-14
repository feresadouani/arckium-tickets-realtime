import {
  ConflictException,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/signin.dto';
import { UserRole, Users } from 'src/users/users.entity';
import { SetupAdminDto } from './dto/setup-admin.dto';
import { isPasswordHashed } from 'src/common/password.util';

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhd])?$/);
  if (!match) return 86400;
  const n = parseInt(match[1], 10);
  const unit = match[2] || 's';
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return n * (multipliers[unit] ?? 1);
}

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const expiresInSec = parseExpiresIn(process.env.JWT_EXPIRESIN ?? '1d');
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: expiresInSec * 1000,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ status: boolean; payload?: Users; message?: string } | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userService.findByEmail(normalizedEmail);
    if (!user) {
      return { status: false, message: 'Invalid email or password' };
    }

    if (user.active === false) {
      return {
        status: false,
        message: 'Account disabled. Contact an administrator.',
      };
    }

    let isValid = false;

    if (isPasswordHashed(user.password)) {
      isValid = await bcrypt.compare(password, user.password);
    } else if (user.password === password) {
      // Migration legacy uniquement
      isValid = true;
      await this.userService.hashAndSavePassword(user, password);
    }

    if (isValid) {
      return { status: true, payload: user };
    }

    return { status: false, message: 'Invalid email or password' };
  }

  private async issueToken(
    user: Users,
    res: Response,
    statusCode = 200,
    extra: Record<string, unknown> = {},
  ) {
    const payload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };
    const secret =
      process.env.JWT_SECRET || 'default-secret-change-in-production';
    const expiresInSec = parseExpiresIn(process.env.JWT_EXPIRESIN ?? '1d');
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: expiresInSec,
      secret,
    });
    res.cookie('access_token', access_token, cookieOptions());
    const { message, ...rest } = extra;
    res.status(statusCode).send({
      message: message ?? 'Login successful',
      ...rest,
    });
  }

  async login(authDto: SignInDto, res: Response) {
    const user = await this.validateUser(authDto.email, authDto.password);
    if (!user || !user.status || !user.payload) {
      res.status(401).send(user?.message ?? 'Identifiants invalides');
      return;
    }
    await this.issueToken(user.payload, res, 200, {
      message: 'Login successful',
    });
  }

  async getSetupStatus(): Promise<{ needsSetup: boolean }> {
    const count = await this.userService.countUsers();
    return { needsSetup: count === 0 };
  }

  async setupAdmin(setupDto: SetupAdminDto, res: Response) {
    const count = await this.userService.countUsers();
    if (count > 0) {
      throw new ConflictException(
        'The application is already set up. Please sign in.',
      );
    }

    const user = await this.userService.create({
      firstname: setupDto.firstname,
      lastname: setupDto.lastname,
      email: setupDto.email.toLowerCase(),
      password: setupDto.password,
      active: true,
      role: UserRole.admin,
    });

    await this.issueToken(user, res, 201, {
      message: 'Administrator created successfully',
      userId: String(user._id),
    });
  }

  async register() {
    const count = await this.userService.countUsers();
    if (count === 0) {
      throw new ForbiddenException(
        'Set up the administrator first via POST /auth/setup',
      );
    }
    throw new ForbiddenException(
      'Public registration is disabled. Contact an administrator.',
    );
  }

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) return null;
    if (user.active === false) {
      throw new UnauthorizedException('Account disabled');
    }
    const profile = { ...user };
    delete (profile as { password?: string }).password;
    return profile;
  }

  logout(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
    res.status(200).send({ message: 'Logout successful' });
  }
}

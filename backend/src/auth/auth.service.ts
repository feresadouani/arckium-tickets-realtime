import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/signin.dto';
import { UserRole, Users } from 'src/users/users.entity';
import { RegisterDto } from './dto/register.dto';

function parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)([smhd])?$/);
    if (!match) return 86400;
    const n = parseInt(match[1], 10);
    const unit = match[2] || 's';
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return n * (multipliers[unit] ?? 1);
}


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<{ status: boolean, payload?: Users, message?: string } | null> {
        const user = await this.userService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            return { "status": true, "payload": user };
        } else {
            return { "status": false, "message": "Invalid email or password!" };
        }
    }

    async login(authDto: SignInDto, res: Response) {
        const user = await this.validateUser(authDto.email, authDto.password);
        if (!user || !user.status || !user.payload) {
            res.status(401).send(user?.message ?? 'Invalid credentials');
            return;
        }
        const payload = { sub: String(user.payload._id), email: user.payload.email, role: user.payload.role };
        const secret = process.env.JWT_SECRET;
        const expiresInSec = parseExpiresIn(process.env.JWT_EXPIRESIN ?? '1d');
        const access_token = await this.jwtService.signAsync(payload, {
            expiresIn: expiresInSec,
            secret,
        });
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
        });
        res.status(200).send({ message: 'Login successful!', token: access_token });
    }

    async register(registerDto: RegisterDto, res: Response) {
        const existing = await this.userService.findByEmail(registerDto.email);
        if (existing) {
            throw new ConflictException('Un compte existe déjà avec cet email.');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.userService.create({
            firstname: registerDto.firstname,
            lastname: registerDto.lastname,
            email: registerDto.email,
            password: hashedPassword,
            active: true,
            role: UserRole.technicien,
        });
        const payload = { sub: String(user._id), email: user.email, role: user.role };
        const secret = process.env.JWT_SECRET;
        const expiresInSec = parseExpiresIn(process.env.JWT_EXPIRESIN ?? '1d');
        const access_token = await this.jwtService.signAsync(payload, {
            expiresIn: expiresInSec,
            secret,
        });
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
        });
        res.status(201).send({ message: 'Inscription réussie !', userId: String(user._id) });
    }

    async getProfile(userId: string) {
        const user = await this.userService.findById(userId);
        if (!user) return null;
        const { password, ...profile } = user;
        return profile;
    }

    async logout(res: Response) {
        res.clearCookie('access_token');
        res.status(200).send({ message: 'Déconnexion réussie' });
    }
}
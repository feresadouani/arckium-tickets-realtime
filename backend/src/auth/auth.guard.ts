import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const cookies = request.cookies as Record<string, string> | undefined;
    const rawToken = cookies?.access_token;

    if (typeof rawToken !== 'string' || !rawToken) {
      throw new UnauthorizedException();
    }

    const token = rawToken;
    const secret =
      process.env.JWT_SECRET || 'default-secret-change-in-production';

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        { secret },
      );
      (request as Request & { user?: JwtPayload }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

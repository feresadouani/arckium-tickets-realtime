import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Public } from './public.decorator';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  async login(@Body() authDto: SignInDto, @Res() res: Response) {
    return this.authService.login(authDto, res);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    return this.authService.register(registerDto, res);
  }

  @Get('me')
  async me(@Req() req: Request & { user?: { sub?: string } }, @Res() res: Response) {
    const sub = req.user?.sub;
    if (!sub) return res.status(401).send({ message: 'Non authentifié' });
    const profile = await this.authService.getProfile(sub);
    if (!profile) return res.status(404).send({ message: 'Utilisateur non trouvé' });
    return res.json(profile);
  }

  @Public()
  @Post('logout')
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
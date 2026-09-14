import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SetupAdminDto } from './dto/setup-admin.dto';
import { Public } from './public.decorator';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('setup/status')
  async setupStatus() {
    return this.authService.getSetupStatus();
  }

  @Public()
  @Post('setup')
  async setup(@Body() setupDto: SetupAdminDto, @Res() res: Response) {
    return this.authService.setupAdmin(setupDto, res);
  }

  @Public()
  @Post('login')
  async login(@Body() authDto: SignInDto, @Res() res: Response) {
    return this.authService.login(authDto, res);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    void registerDto;
    return this.authService.register();
  }

  @Get('me')
  async me(
    @Req() req: Request & { user?: { sub?: string } },
    @Res() res: Response,
  ) {
    const sub = req.user?.sub;
    if (!sub) return res.status(401).send({ message: 'Unauthenticated' });
    const profile = await this.authService.getProfile(sub);
    if (!profile) return res.status(404).send({ message: 'User not found' });
    return res.json(profile);
  }

  @Public()
  @Post('logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}

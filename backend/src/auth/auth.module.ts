import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhd])?$/);
  if (!match) return 86400;
  const n = parseInt(match[1], 10);
  const unit = match[2] || 's';
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * (multipliers[unit] ?? 1);
}
@Module({
  imports: [UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: parseExpiresIn(process.env.JWT_EXPIRESIN ?? '1d') },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}

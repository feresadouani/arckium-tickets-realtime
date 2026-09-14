import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    const guard = new AuthGuard(
      { verifyAsync: jest.fn() } as unknown as JwtService,
      new Reflector(),
    );
    expect(guard).toBeDefined();
  });
});

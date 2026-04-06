import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import refreshConfig from '../config/refresh.config';
import type { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshConfig.KEY)
    private readonly refreshConfiguration: ReturnType<typeof refreshConfig>,
    private authService: AuthService,
  ) {
    const secret = refreshConfiguration.secret;

    if (!secret && process.env.WORKER_MODE === 'true') {
      super({
        jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
        secretOrKey: 'worker-placeholder',
        ignoreExpiration: false,
        passReqToCallback: true,
      });
      return;
    }

    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      secretOrKey: secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: AuthJwtPayload) {
    const userId = payload.sub;
    const refreshToken = req.body?.refresh as string | undefined;

    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}

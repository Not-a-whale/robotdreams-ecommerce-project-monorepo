import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import type { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService,
  ) {
    if (!googleConfig.clientId || !googleConfig.clientSecret || !googleConfig.callbackURL) {
      throw new Error('Google OAuth is not fully configured');
    }

    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackURL,
      passReqToCallback: false,
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('Google account email is not available');
    }

    const user = await this.authService.validateGoogleUser({
      email,
      name: profile.displayName,
      password: '', // No password for OAuth users
    });

    return user;
  }
}

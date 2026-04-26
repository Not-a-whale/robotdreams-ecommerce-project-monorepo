import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { SessionsService } from './sessions.service';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

function verifyAppJWT(token: string): Record<string, unknown> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const expected = createHmac('sha256', secret)
    .update(`${parts[0]}.${parts[1]}`)
    .digest('base64url');

  if (expected !== parts[2]) throw new Error('Invalid signature');

  const payload = JSON.parse(
    Buffer.from(parts[1], 'base64url').toString('utf8'),
  ) as Record<string, unknown>;

  if (
    typeof payload.exp === 'number' &&
    payload.exp < Math.floor(Date.now() / 1000)
  ) {
    throw new Error('Token expired');
  }

  return payload;
}

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Headers('authorization') auth: string,
    @Body('cart') cart: CartItem[],
  ) {
    const token = auth?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException();

    try {
      verifyAppJWT(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const clientSecret = await this.sessionsService.createPaymentIntent(cart);
    return { clientSecret };
  }
}


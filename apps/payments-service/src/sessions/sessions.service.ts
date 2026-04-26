import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

interface CartItem {
  price: number;
  quantity: number;
}

@Injectable()
export class SessionsService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  async createPaymentIntent(cart: CartItem[]): Promise<string> {
    const amount = cart.reduce(
      (sum, item) => sum + Math.round(item.price * item.quantity),
      0,
    );

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe did not return a client secret');
    }

    return paymentIntent.client_secret;
  }
}

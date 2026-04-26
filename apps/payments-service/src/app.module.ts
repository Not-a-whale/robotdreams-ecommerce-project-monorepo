import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [PaymentsModule, SessionsModule],
})
export class AppModule {}

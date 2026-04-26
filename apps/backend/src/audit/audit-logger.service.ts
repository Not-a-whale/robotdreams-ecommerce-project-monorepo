import { Injectable, Logger } from '@nestjs/common';

export type AuditOutcome = 'success' | 'failure';

export interface AuditEvent {
  action: string;
  actorId: string | null;
  targetType: string;
  targetId: string | null;
  outcome: AuditOutcome;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger('Audit');

  log(event: AuditEvent): void {
    const entry = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    this.logger.log(JSON.stringify(entry));
  }
}

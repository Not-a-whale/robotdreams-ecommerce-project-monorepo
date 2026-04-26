import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database — required, no silent defaults in runtime
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),

  // JWT — required, enforce minimum entropy
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(3600),
  REFRESH_JWT_SECRET: z.string().min(32),
  REFRESH_JWT_EXPIRES_IN: z.coerce.number().int().positive().default(86400),

  // Frontend — required (used in CORS + OAuth redirect)
  FRONTEND_URL: z.string().url(),

  // Google OAuth — optional (feature disabled when absent)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // AWS S3 — optional (file uploads disabled when absent)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().optional(),

  // RabbitMQ — optional (async order processing disabled when absent)
  RABBITMQ_URL: z.string().default('amqp://admin:admin@localhost:5672'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.error(`\n❌ Environment validation failed:\n${formatted}\n`);
    process.exit(1);
  }

  return result.data;
}

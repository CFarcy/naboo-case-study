import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRATION_TIME: z.string().min(1, 'JWT_EXPIRATION_TIME is required'),
  FRONTEND_DOMAIN: z
    .string()
    .min(1, 'FRONTEND_DOMAIN is required')
    .refine(
      (value) =>
        value === 'localhost' ||
        (/^[a-z0-9.-]+$/i.test(value) &&
          !value.includes(':') &&
          !value.includes('/')),
      {
        message:
          'FRONTEND_DOMAIN must be a bare hostname (no scheme, no path, no port)',
      },
    ),
  FRONTEND_URL: z
    .string()
    .min(1, 'FRONTEND_URL is required')
    .refine(
      (value) => {
        try {
          // eslint-disable-next-line no-new
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'FRONTEND_URL must be a valid URL',
      },
    ),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      // eslint-disable-next-line no-console
      console.error(
        `Missing or invalid environment variables:\n${issues}\n` +
          'Ensure back-end/.env exists and is populated from back-end/.env.dist',
      );
    } else {
      // eslint-disable-next-line no-console
      console.error('Unexpected error validating environment:', error);
    }
    process.exit(1);
  }
}

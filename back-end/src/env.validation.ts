import { z } from 'zod';

function trimmedNonEmpty(message: string) {
  return z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, message));
}

const envSchema = z.object({
  MONGO_URI: trimmedNonEmpty('MONGO_URI is required'),
  JWT_SECRET: trimmedNonEmpty('JWT_SECRET is required'),
  JWT_EXPIRATION_TIME: trimmedNonEmpty('JWT_EXPIRATION_TIME is required'),
  FRONTEND_DOMAIN: trimmedNonEmpty('FRONTEND_DOMAIN is required').refine(
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
  FRONTEND_URL: trimmedNonEmpty('FRONTEND_URL is required').refine(
    (value) => {
      try {
        const url = new URL(value);
        return (
          (url.protocol === 'http:' || url.protocol === 'https:') &&
          url.pathname === '/' &&
          url.search === '' &&
          url.hash === '' &&
          url.username === '' &&
          url.password === ''
        );
      } catch {
        return false;
      }
    },
    {
      message:
        'FRONTEND_URL must be a valid http(s) origin (no path, query, hash, or auth)',
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

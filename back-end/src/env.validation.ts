const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRATION_TIME',
  'FRONTEND_DOMAIN',
  'FRONTEND_URL',
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateEnv(): void {
  const missing: RequiredEnvVar[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (!isNonEmptyString(value)) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const message =
      `Missing required environment variable${
        missing.length > 1 ? 's' : ''
      }: ${missing.join(', ')}\n` +
      'Ensure back-end/.env exists and is populated from back-end/.env.dist';
    // eslint-disable-next-line no-console
    console.error(message);
    process.exit(1);
  }
}

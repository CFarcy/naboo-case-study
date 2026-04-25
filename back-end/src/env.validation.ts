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

function isValidUrl(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidFrontendDomain(value: string): boolean {
  if (value === 'localhost') return true;
  // Reject scheme, path, or port in the domain value
  return (
    /^[a-z0-9.-]+$/i.test(value) &&
    !value.includes(':') &&
    !value.includes('/')
  );
}

export function validateEnv(): void {
  const invalid: RequiredEnvVar[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (!isNonEmptyString(value)) {
      invalid.push(key);
      continue;
    }
    if (key === 'FRONTEND_URL' && !isValidUrl(value)) {
      invalid.push(key);
      continue;
    }
    if (key === 'FRONTEND_DOMAIN' && !isValidFrontendDomain(value)) {
      invalid.push(key);
    }
  }

  if (invalid.length > 0) {
    const message =
      `Missing or invalid environment variable${
        invalid.length > 1 ? 's' : ''
      }: ${invalid.join(', ')}\n` +
      'Ensure back-end/.env exists and is populated from back-end/.env.dist';
    // eslint-disable-next-line no-console
    console.error(message);
    process.exit(1);
  }
}

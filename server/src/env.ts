import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET ?? '';
  if (secret.length < 32) {
    if ((process.env.NODE_ENV ?? 'development') === 'production') {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    console.warn('[env] JWT_SECRET is short; use 32+ random chars in production');
  }
  return secret;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3001),
  DATABASE_URL: required('DATABASE_URL'),
  DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL ?? required('DATABASE_URL'),
  JWT_SECRET: requireJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? './uploads',
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS ?? 12)
};
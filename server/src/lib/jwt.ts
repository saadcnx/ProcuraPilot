import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../env';

export interface TokenPayload {
  sub: string;
  role: 'inspector' | 'boss';
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
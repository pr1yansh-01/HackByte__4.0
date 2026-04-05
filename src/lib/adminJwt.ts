import { SignJWT, jwtVerify, type JWTVerifyResult } from 'jose';

export const ADMIN_SESSION_COOKIE = 'admin_session';

export function getJwtSecretKey(): Uint8Array {
  const raw = process.env.ADMIN_JWT_SECRET;
  if (raw && raw.length >= 16) {
    return new TextEncoder().encode(raw);
  }
  return new TextEncoder().encode('dev-only-min-16-chars!');
}

export async function signAdminSessionToken(userId: string, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecretKey());
}

export async function verifyAdminSessionToken(
  token: string
): Promise<JWTVerifyResult> {
  return jwtVerify(token, getJwtSecretKey());
}

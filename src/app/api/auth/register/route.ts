import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  ADMIN_SESSION_COOKIE,
  signAdminSessionToken,
} from '@/lib/adminJwt';
import { createAdminUser, findAdminByEmail } from '@/lib/adminUserStore';

export const runtime = 'nodejs';

function validEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name : '';

  if (!validEmail(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  if (await findAdminByEmail(email)) {
    return NextResponse.json(
      { error: 'An account with this email already exists' },
      { status: 409 }
    );
  }

  let user;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await createAdminUser({ email, passwordHash, name });
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_EXISTS') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    throw e;
  }

  const token = await signAdminSessionToken(user.id, user.email);
  const res = NextResponse.json({
    ok: true,
    user: { email: user.email, name: user.name },
  });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}

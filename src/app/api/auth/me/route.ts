import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminJwt';
import { findAdminById } from '@/lib/adminUserStore';

export const runtime = 'nodejs';

export async function GET() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { payload } = await verifyAdminSessionToken(token);
    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    if (!sub) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const user = await findAdminById(sub);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: { email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

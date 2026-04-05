import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ADMIN_SESSION_COOKIE, getJwtSecretKey } from '@/lib/adminJwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/dashboard/login') ||
    pathname.startsWith('/dashboard/register')
  ) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (token) {
      try {
        await jwtVerify(token, getJwtSecretKey());
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        /* invalid session — show auth page */
      }
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/dashboard/login', request.url));
  }

  try {
    await jwtVerify(token, getJwtSecretKey());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/dashboard/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};

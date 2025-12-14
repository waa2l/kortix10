import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protected routes
  const adminRoutes = ['/admin/dashboard', '/admin/settings'];
  const doctorRoutes = ['/doctor/dashboard', '/doctor/consultations'];

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const adminSession = request.cookies.get('adminSession');
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check doctor routes
  if (doctorRoutes.some((route) => pathname.startsWith(route))) {
    const doctorSession = request.cookies.get('doctorSession');
    if (!doctorSession) {
      return NextResponse.redirect(new URL('/doctor/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
  ],
};

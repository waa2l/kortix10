import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // هذا السطر يقوم بتجديد الجلسة وتحديث الكوكيز في الـ response
  const { data: { session } } = await supabase.auth.getSession();

  // حماية المسارات
  if (req.nextUrl.pathname.startsWith('/patient')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith('/auth/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/patient', req.url));
    }
  }

  // ⚠️ هام جداً: يجب إرجاع res التي تم تعديلها بواسطة Supabase
  return res;
}

export const config = {
  matcher: ['/patient/:path*', '/auth/login'],
};

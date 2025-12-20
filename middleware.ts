import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // إنشاء عميل Supabase الخاص بالوسيط
  const supabase = createMiddlewareClient({ req, res });

  // التحقق من الجلسة الحالية
  const { data: { session } } = await supabase.auth.getSession();

  // 1. حماية مسار المريض (Patient)
  // إذا كان المستخدم يحاول دخول أي صفحة تبدأ بـ /patient وهو غير مسجل دخول
  if (req.nextUrl.pathname.startsWith('/patient')) {
    if (!session) {
      // توجيهه فوراً لصفحة الدخول
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // 2. (اختياري) منع المسجلين من دخول صفحة تسجيل الدخول مرة أخرى
  if (req.nextUrl.pathname.startsWith('/auth/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/patient', req.url));
    }
  }

  return res;
}

// تحديد المسارات التي يعمل عليها هذا الملف
export const config = {
  matcher: ['/patient/:path*', '/auth/login'],
};

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    // إنشاء العميل الذي يتعامل مع الكوكيز تلقائياً
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // تبديل الكود بجلسة مستخدم وتخزينها في الكوكيز
    await supabase.auth.exchangeCodeForSession(code);
  }

  // التوجيه لصفحة المريض بعد النجاح
  return NextResponse.redirect(new URL('/patient', request.url));
}

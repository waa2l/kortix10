import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    // تبديل الكود بـ Session فعلية
    await supabase.auth.exchangeCodeForSession(code);
  }

  // التوجيه النهائي لصفحة المريض
  return NextResponse.redirect(new URL('/patient', request.url));
}

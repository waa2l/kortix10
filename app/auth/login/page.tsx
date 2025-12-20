'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// 1. تغيير الاستيراد الهام جداً
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

// ... (نفس كود أيقونة جوجل GoogleIcon السابق لا تغيير فيه) ...
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function AuthPage() {
  const router = useRouter();
  // 2. إنشاء نسخة supabase مرتبطة بالصفحة
  const supabase = createClientComponentClient();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // --- تسجيل الدخول ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        // 3. الخطوة الأهم: تحديث الراوتر وتوجيه المستخدم
        router.refresh(); // لتحديث حالة السيرفر
        router.push('/patient'); // التوجيه لصفحة المريض
      
      } else {
        // --- تسجيل حساب جديد ---
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone
            }
          }
        });
        if (error) throw error;
        alert('تم إنشاء الحساب! يرجى تأكيد البريد الإلكتروني.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-cairo" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="bg-blue-600 p-6 text-center text-white">
          <h1 className="text-2xl font-bold mb-2">المركز الطبي الذكي</h1>
          <p className="text-blue-100 text-sm">بوابة خدمات المرضى</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center font-bold">{error}</div>}

          <button onClick={handleGoogleLogin} className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-3 mb-6 shadow-sm">
            <GoogleIcon />
            <span>المتابعة باستخدام Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">أو باستخدام البريد</span></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative"><User className="absolute right-3 top-3 text-slate-400 w-5 h-5"/><input type="text" placeholder="الاسم رباعي" required className="w-full pr-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                <div className="relative"><Phone className="absolute right-3 top-3 text-slate-400 w-5 h-5"/><input type="tel" placeholder="رقم الهاتف" required className="w-full pr-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              </>
            )}
            <div className="relative"><Mail className="absolute right-3 top-3 text-slate-400 w-5 h-5"/><input type="email" placeholder="البريد الإلكتروني" required className="w-full pr-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="relative"><Lock className="absolute right-3 top-3 text-slate-400 w-5 h-5"/><input type="password" placeholder="كلمة المرور" required className="w-full pr-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : (isLogin ? 'دخول' : 'تسجيل')}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-sm mb-2">{isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}</p>
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline">{isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

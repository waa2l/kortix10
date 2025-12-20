'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, Phone, ArrowLeft, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // للتبديل بين دخول وتسجيل
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // نموذج البيانات
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

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
        
        // نجاح الدخول -> توجيه لصفحة المريض
        router.replace('/patient');
      
      } else {
        // --- إنشاء حساب جديد ---
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            // إرسال البيانات الإضافية ليتم استخدامها في الـ Trigger لإنشاء ملف المريض
            data: {
              full_name: formData.fullName,
              phone: formData.phone
            }
          }
        });
        if (error) throw error;

        alert('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
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
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center text-white">
          <h1 className="text-2xl font-bold mb-2">المركز الطبي الذكي</h1>
          <p className="text-blue-100 text-sm">بوابة خدمات المرضى الإلكترونية</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* حقول التسجيل الجديد فقط */}
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                  <input 
                    type="text" 
                    placeholder="الاسم رباعي"
                    required
                    className="w-full pr-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                  <input 
                    type="tel" 
                    placeholder="رقم الهاتف"
                    required
                    className="w-full pr-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </>
            )}

            {/* البريد وكلمة المرور (مشترك) */}
            <div className="relative">
              <Mail className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
              <input 
                type="email" 
                placeholder="البريد الإلكتروني"
                required
                className="w-full pr-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
              <input 
                type="password" 
                placeholder="كلمة المرور"
                required
                className="w-full pr-10 p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : (isLogin ? 'دخول' : 'تسجيل')}
            </button>
          </form>

          {/* التبديل بين الدخول والتسجيل */}
          <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-sm mb-2">
              {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            </p>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

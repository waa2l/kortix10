'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Stethoscope, Lock, User, Phone, CreditCard, Mail, AlertCircle } from 'lucide-react';

export default function DoctorLogin() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    doctor_number: '',
    phone: '',
    national_id: '',
    email: '',
    code: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // 1. التحقق عند التحميل (Auto-Redirect)
  useEffect(() => {
    // التحقق من الحظر
    const storedAttempts = localStorage.getItem('login_attempts');
    const storedLockout = localStorage.getItem('login_lockout_time');

    if (storedLockout) {
      const lockoutEnd = parseInt(storedLockout);
      if (Date.now() < lockoutEnd) {
        setLockoutTime(lockoutEnd);
        setError('تم تجاوز عدد المحاولات. الحساب محظور مؤقتاً.');
      } else {
        localStorage.removeItem('login_lockout_time');
        localStorage.removeItem('login_attempts');
        setAttempts(0);
        setLockoutTime(null);
      }
    } else if (storedAttempts) {
      setAttempts(parseInt(storedAttempts));
    }

    // التحقق من حالة الدخول
    const storedData = localStorage.getItem('doctorData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed?.id) {
          // مسجل بالفعل -> انتقل للداشبورد
          router.replace('/doctor/dashboard');
        }
      } catch (e) {
        localStorage.removeItem('doctorData');
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('login_attempts', newAttempts.toString());

    if (newAttempts >= 3) {
      const lockTime = Date.now() + 15 * 60 * 1000;
      setLockoutTime(lockTime);
      localStorage.setItem('login_lockout_time', lockTime.toString());
      setError('تم تجاوز عدد المحاولات (3). تم حظر الدخول لمدة 15 دقيقة.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockoutTime) {
      if (Date.now() < lockoutTime) {
        setError('الحساب محظور مؤقتاً.');
        return;
      } else {
        setLockoutTime(null);
        localStorage.removeItem('login_lockout_time');
        setAttempts(0);
      }
    }

    setLoading(true);

    try {
      console.log('Attemping login for:', formData.doctor_number);

      // 1. البحث
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('doctor_number', formData.doctor_number.trim())
        .single();

      if (error || !data) {
        handleFailedAttempt();
        setLoading(false);
        throw new Error('كود الطبيب (Doctor Number) غير صحيح');
      }

      // 2. المطابقة
      // استخدام trim() و toLowerCase() لتفادي مشاكل المسافات وحالة الأحرف
      if (data.phone?.trim() !== formData.phone.trim()) throw new Error('رقم الهاتف غير مطابق');
      if (data.national_id?.trim() !== formData.national_id.trim()) throw new Error('الرقم القومي غير مطابق');
      if (data.email?.trim().toLowerCase() !== formData.email.trim().toLowerCase()) throw new Error('البريد الإلكتروني غير مطابق');
      if (data.code?.trim() !== formData.code.trim()) throw new Error('رمز الدخول (Code) غير صحيح');

      // 3. النجاح
      console.log('Login successful, saving data...');
      
      // حفظ البيانات
      localStorage.setItem('doctorData', JSON.stringify(data));
      
      // تنظيف
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('login_lockout_time');

      // 4. الانتقال (الناعم)
      // نستخدم push بدلاً من window.location لتجنب إعادة تحميل التطبيق بالكامل
      router.push('/doctor/dashboard');

    } catch (err: any) {
      console.error("Login Error:", err);
      // إذا لم يكن الخطأ قد تم التعامل معه (مثل Throw Error)
      if (!error) {
         // إذا كان الخطأ غير محدد، نعتبره محاولة فاشلة
         if (!err.message.includes('غير مطابق') && !err.message.includes('غير صحيح')) {
            handleFailedAttempt();
         }
         setError(err.message || "حدث خطأ غير متوقع");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-cairo" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200">
        
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">بوابة الأطباء</h1>
          <p className="text-slate-500 mt-2 text-sm">تسجيل دخول آمن (جميع الحقول مطلوبة)</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm font-bold border border-red-100 animate-pulse">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {lockoutTime && (
           <div className="text-center text-red-500 font-bold mb-4 bg-red-50 p-2 rounded border border-red-200">
             حاول مرة أخرى بعد: {Math.ceil((lockoutTime - Date.now()) / 60000)} دقيقة
           </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* 1. Doctor Number */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">كود الطبيب (Doctor No)</label>
            <div className="relative">
              <User className="absolute right-3 top-3 text-slate-400 w-4 h-4" />
              <input type="text" name="doctor_number" value={formData.doctor_number} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="مثال: DOC001" required disabled={!!lockoutTime} />
            </div>
          </div>

          {/* 2. Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 text-slate-400 w-4 h-4" />
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="01xxxxxxxxx" required disabled={!!lockoutTime} />
            </div>
          </div>

          {/* 3. National ID */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">الرقم القومي</label>
            <div className="relative">
              <CreditCard className="absolute right-3 top-3 text-slate-400 w-4 h-4" />
              <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="14 رقم" required disabled={!!lockoutTime} />
            </div>
          </div>

          {/* 4. Email */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 text-slate-400 w-4 h-4" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="email@example.com" required disabled={!!lockoutTime} />
            </div>
          </div>

          {/* 5. Code */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">رمز الدخول (4 أرقام)</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 text-slate-400 w-4 h-4" />
              <input type="password" name="code" value={formData.code} onChange={handleChange} maxLength={4} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-widest" placeholder="****" required disabled={!!lockoutTime} />
            </div>
          </div>

          <button type="submit" disabled={loading || !!lockoutTime} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-blue-200 mt-4">
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>

        </form>
        
        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">عدد المحاولات المتبقية: <span className="font-bold text-red-500">{Math.max(0, 3 - attempts)}</span></p>
        </div>

      </div>
    </div>
  );
}

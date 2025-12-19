'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Stethoscope, Lock, User, AlertCircle } from 'lucide-react';

export default function DoctorLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // Can be email, phone, national_id, doctor_number
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Check Lockout on Mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('login_attempts');
    const storedLockout = localStorage.getItem('login_lockout_time');

    if (storedLockout) {
      const lockoutEnd = parseInt(storedLockout);
      if (Date.now() < lockoutEnd) {
        setLockoutTime(lockoutEnd);
        setError('تم تجاوز عدد المحاولات. يرجى الانتظار 15 دقيقة.');
      } else {
        // Lockout expired
        localStorage.removeItem('login_lockout_time');
        localStorage.removeItem('login_attempts');
        setAttempts(0);
        setLockoutTime(null);
      }
    } else if (storedAttempts) {
      setAttempts(parseInt(storedAttempts));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if locked out
    if (lockoutTime) {
      if (Date.now() < lockoutTime) {
        setError('الحساب محظور مؤقتاً. يرجى الانتظار.');
        return;
      } else {
        setLockoutTime(null);
        localStorage.removeItem('login_lockout_time');
        setAttempts(0);
      }
    }

    setLoading(true);

    try {
      // 1. Fetch doctor by ANY identifier
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .or(`email.eq.${identifier},phone.eq.${identifier},national_id.eq.${identifier},doctor_number.eq.${identifier}`)
        .single();

      if (error || !data) {
        handleFailedAttempt();
        throw new Error('بيانات الدخول غير صحيحة');
      }

      // 2. Verify Code
      if (data.code !== code) {
        handleFailedAttempt();
        throw new Error('رمز الدخول (Code) غير صحيح');
      }

      // Success
      localStorage.setItem('doctorData', JSON.stringify(data));
      localStorage.removeItem('login_attempts'); // Reset attempts on success
      router.push('/doctor/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('login_attempts', newAttempts.toString());

    if (newAttempts >= 3) {
      const lockTime = Date.now() + 15 * 60 * 1000; // 15 Minutes
      setLockoutTime(lockTime);
      localStorage.setItem('login_lockout_time', lockTime.toString());
      setError('تم تجاوز عدد المحاولات (3). تم حظر الدخول لمدة 15 دقيقة.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-cairo" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">بوابة الأطباء</h1>
          <p className="text-slate-500 mt-2 text-sm">سجل الدخول لمتابعة عيادتك</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm font-bold border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Lockout Timer Message */}
        {lockoutTime && (
           <div className="text-center text-red-500 font-bold mb-4">
             حاول مرة أخرى بعد: {Math.ceil((lockoutTime - Date.now()) / 60000)} دقيقة
           </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">المعرف (رقم، هاتف، قومي، إيميل)</label>
            <div className="relative">
              <User className="absolute right-3 top-3.5 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-10 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="أدخل بياناتك"
                required
                disabled={!!lockoutTime}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">رمز الدخول (4 أرقام)</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3.5 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={4}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-10 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono tracking-widest text-lg"
                placeholder="****"
                required
                disabled={!!lockoutTime}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !!lockoutTime}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-blue-200"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>

        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">عدد المحاولات المتبقية: {Math.max(0, 3 - attempts)}</p>
        </div>

      </div>
    </div>
  );
}

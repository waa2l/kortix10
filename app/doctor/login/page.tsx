'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Stethoscope, Lock, User, Phone, CreditCard, Mail, AlertCircle } from 'lucide-react';

export default function DoctorLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ doctor_number: '', phone: '', national_id: '', email: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // التحقق المبدئي: لو مسجل دخول، وديه الداشبورد
  useEffect(() => {
    if (localStorage.getItem('doctorData')) {
      router.replace('/doctor/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attemping login...');

      // 1. البحث
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('doctor_number', formData.doctor_number.trim())
        .single();

      if (error || !data) throw new Error('كود الطبيب غير صحيح');

      // 2. التحقق (Validation)
      if (data.phone?.trim() !== formData.phone.trim()) throw new Error('رقم الهاتف غير مطابق');
      if (data.national_id?.trim() !== formData.national_id.trim()) throw new Error('الرقم القومي غير مطابق');
      if (data.email?.trim().toLowerCase() !== formData.email.trim().toLowerCase()) throw new Error('البريد الإلكتروني غير مطابق');
      if (data.code?.trim() !== formData.code.trim()) throw new Error('الكود السري غير صحيح');

      // 3. الحفظ والتوجيه
      localStorage.setItem('doctorData', JSON.stringify(data));
      
      // هام: استخدام window.location.href هنا يضمن "تصفير" حالة التطبيق والانتقال النظيف
      // هذا يمنع أي تداخل مع الـ router القديم
      window.location.href = '/doctor/dashboard';

    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-cairo" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">بوابة الأطباء</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm font-bold border border-red-100">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative"><User className="absolute right-3 top-3 text-slate-400 w-4 h-4"/><input name="doctor_number" onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 text-sm" placeholder="كود الطبيب" required /></div>
          <div className="relative"><Phone className="absolute right-3 top-3 text-slate-400 w-4 h-4"/><input name="phone" onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 text-sm" placeholder="رقم الهاتف" required /></div>
          <div className="relative"><CreditCard className="absolute right-3 top-3 text-slate-400 w-4 h-4"/><input name="national_id" onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 text-sm" placeholder="الرقم القومي" required /></div>
          <div className="relative"><Mail className="absolute right-3 top-3 text-slate-400 w-4 h-4"/><input name="email" type="email" onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 text-sm" placeholder="البريد الإلكتروني" required /></div>
          <div className="relative"><Lock className="absolute right-3 top-3 text-slate-400 w-4 h-4"/><input name="code" type="password" onChange={handleChange} maxLength={4} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-10 text-lg tracking-widest" placeholder="الكود السري" required /></div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 disabled:opacity-50">
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

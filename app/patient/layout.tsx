'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// استيراد أيقونة الخروج
import { User, FileText, Calendar, Calculator, Mail, LogOut, Activity } from 'lucide-react';
import Link from 'next/link';
import PatientNotificationsListener from "@/components/PatientNotificationsListener";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تحقق إضافي في المتصفح
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // --- دالة تسجيل الخروج ---
  const handleLogout = async () => {
    await supabase.auth.signOut(); // مسح الجلسة من Supabase
    router.replace('/auth/login'); // التوجيه لصفحة الدخول
    router.refresh(); // تحديث الصفحة لمسح أي بيانات معلقة
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600">جاري التحميل والتحقق...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-cairo flex flex-col md:flex-row" dir="rtl">
      
      <PatientNotificationsListener />

      {/* القائمة الجانبية */}
      <aside className="bg-white w-full md:w-64 border-l p-4 flex flex-col gap-2 shrink-0 shadow-sm z-10">
        <div className="mb-6 p-2 text-center border-b border-slate-100 pb-4">
           <h1 className="font-bold text-xl text-blue-600">بوابة المريض</h1>
        </div>
        
        <Link href="/patient" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium">
           <Activity className="w-5 h-5"/> الرئيسية
        </Link>
        <Link href="/patient/records" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium">
           <FileText className="w-5 h-5"/> السجلات الطبية
        </Link>
        <Link href="/patient/appointments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium">
           <Calendar className="w-5 h-5"/> المواعيد
        </Link>
        <Link href="/patient/inbox" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium">
           <Mail className="w-5 h-5"/> الرسائل
        </Link>
        <Link href="/patient/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium">
           <User className="w-5 h-5"/> الملف الشخصي
        </Link>
        
        {/* زر تسجيل الخروج الجديد */}
        <button 
          onClick={handleLogout} 
          className="mt-auto flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 font-bold transition-colors"
        >
           <LogOut className="w-5 h-5"/> تسجيل خروج
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}

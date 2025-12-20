'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// استيراد النسخة الخاصة بالمتصفح (هام جداً للخروج)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, FileText, Calendar, Mail, LogOut, Activity, Menu, X } from 'lucide-react';
import Link from 'next/link';
// تأكد أن هذا المكون موجود، إذا لم يكن موجوداً احذف السطر
import PatientNotificationsListener from "@/components/PatientNotificationsListener";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponentClient(); // إنشاء عميل Supabase
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // للقائمة في الموبايل

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  // --- دالة تسجيل الخروج الصحيحة ---
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // 1. مسح الجلسة
      router.refresh();              // 2. تحديث بيانات السيرفر (هام جداً)
      router.replace('/auth/login'); // 3. التوجيه لصفحة الدخول
    } catch (error) {
      console.error('Logout error:', error);
      // في حالة حدوث خطأ، وجهه للصفحة الرئيسية قسراً
      window.location.href = '/'; 
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-blue-600 gap-2">
        <Activity className="w-6 h-6 animate-spin"/>
        <span>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-cairo flex flex-col md:flex-row" dir="rtl">
      
      {/* هذا السطر لتشغيل الإشعارات، إذا لم يكن الملف لديك احذفه مؤقتاً */}
      {/* <PatientNotificationsListener /> */}

      {/* زر القائمة للموبايل */}
      <div className="md:hidden bg-white p-4 border-b flex justify-between items-center shadow-sm">
        <h1 className="font-bold text-blue-600">بوابة المريض</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-100 rounded-lg">
          {isSidebarOpen ? <X/> : <Menu/>}
        </button>
      </div>

      {/* القائمة الجانبية */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="hidden md:block mb-8 p-2 text-center border-b border-slate-100 pb-4">
             <h1 className="font-bold text-xl text-blue-600">بوابة المريض</h1>
          </div>
          
          <nav className="space-y-2 flex-1">
            <Link href="/patient" onClick={()=>setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium transition-colors">
               <Activity className="w-5 h-5"/> الرئيسية
            </Link>
            <Link href="/patient/records" onClick={()=>setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium transition-colors">
               <FileText className="w-5 h-5"/> السجلات الطبية
            </Link>
            <Link href="/patient/appointments" onClick={()=>setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium transition-colors">
               <Calendar className="w-5 h-5"/> المواعيد
            </Link>
            <Link href="/patient/inbox" onClick={()=>setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium transition-colors">
               <Mail className="w-5 h-5"/> الرسائل
            </Link>
            <Link href="/patient/profile" onClick={()=>setIsSidebarOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700 font-medium transition-colors">
               <User className="w-5 h-5"/> الملف الشخصي
            </Link>
          </nav>
          
          {/* زر تسجيل الخروج */}
          <button 
            onClick={handleLogout} 
            className="mt-auto flex items-center gap-3 p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-colors w-full"
          >
             <LogOut className="w-5 h-5"/> تسجيل خروج
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        {children}
      </main>

      {/* خلفية معتمة للموبايل عند فتح القائمة */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
        />
      )}
    </div>
  );
}

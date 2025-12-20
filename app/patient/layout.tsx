'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, FileText, Calendar, Calculator, Mail, LogOut, Activity } from 'lucide-react';
import Link from 'next/link';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login'); // توجيه لصفحة الدخول
      } else {
        // التأكد أن له سجل في جدول patients (يتم عبر Trigger، لكن للاحتياط)
        const { data: patient } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (!patient) {
           // حالة نادرة: المستخدم مسجل لكن ليس له ملف مريض
           // يمكن توجيهه لصفحة استكمال البيانات
        }
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-cairo flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar Mobile/Desktop */}
      <aside className="bg-white w-full md:w-64 border-l p-4 flex flex-col gap-2 shrink-0">
        <div className="mb-6 p-2 text-center">
           <h1 className="font-bold text-xl text-blue-600">ملفي الطبي</h1>
        </div>
        
        <Link href="/patient" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700">
           <Activity className="w-5 h-5"/> الرئيسية
        </Link>
        <Link href="/patient/records" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700">
           <FileText className="w-5 h-5"/> السجلات الطبية
        </Link>
        <Link href="/patient/appointments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700">
           <Calendar className="w-5 h-5"/> حجز المواعيد
        </Link>
        <Link href="/patient/calculators" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700">
           <Calculator className="w-5 h-5"/> الحاسبات
        </Link>
        <Link href="/patient/inbox" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700">
           <Mail className="w-5 h-5"/> الرسائل
        </Link>
        <Link href="/patient/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-700">
           <User className="w-5 h-5"/> الملف الشخصي
        </Link>
        
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="mt-auto flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600">
           <LogOut className="w-5 h-5"/> تسجيل خروج
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

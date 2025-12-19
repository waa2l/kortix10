'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDoctors } from '@/lib/hooks';
import { LogOut, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const router = useRouter();
  const { loading } = useDoctors();
  const [isClient, setIsClient] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // 1. استخدام الاسم الصحيح: doctorData
    const storedData = localStorage.getItem('doctorData');
    
    if (!storedData) {
      router.replace('/doctor/login');
    } else {
      setDoctor(JSON.parse(storedData));
    }
  }, [router]);

  const handleLogout = () => {
    // 2. حذف المفتاح الصحيح عند الخروج
    localStorage.removeItem('doctorData');
    
    // التوجيه لصفحة الدخول
    router.replace('/doctor/login');
  };

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-slate-500 font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-lg">
               <FileText className="w-6 h-6 text-blue-600"/>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">لوحة الطبيب</h1>
              <p className="text-xs text-slate-500">أهلاً بك، د. {doctor?.full_name}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">الاستشارات المفتوحة</p>
              <p className="text-3xl font-black text-slate-800">5</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full"><FileText className="w-6 h-6 text-green-600" /></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">مواعيد اليوم</p>
              <p className="text-3xl font-black text-slate-800">8</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full"><Calendar className="w-6 h-6 text-blue-600" /></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">رصيد الإجازات</p>
              <p className="text-3xl font-black text-slate-800">{doctor?.annual_leave_balance || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full"><AlertCircle className="w-6 h-6 text-purple-600" /></div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          
          <Link href="/doctor/consultations" className="group">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">الاستشارات الطبية</h3>
              <p className="text-slate-500 text-sm">متابعة حالات المرضى والرد على الاستشارات الجديدة</p>
            </div>
          </Link>

          <Link href="/doctor/attendance" className="group">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">سجل الحضور</h3>
              <p className="text-slate-500 text-sm">تسجيل الحضور والانصراف ومراجعة السجلات الشهرية</p>
            </div>
          </Link>

          <Link href="/doctor/leave_requests" className="group">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">طلبات الإجازة</h3>
              <p className="text-slate-500 text-sm">تقديم طلبات الإجازة الاعتيادية والعارضة ومتابعة حالتها</p>
            </div>
          </Link>

          <Link href="/doctor/profile" className="group">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">الملف الشخصي</h3>
              <p className="text-slate-500 text-sm">تحديث بيانات التواصل وكلمة المرور</p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}

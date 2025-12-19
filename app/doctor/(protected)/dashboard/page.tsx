
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDoctors } from '@/lib/hooks';
import { LogOut, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const router = useRouter();
  const { doctors, loading } = useDoctors();
  const [isClient, setIsClient] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);

useEffect(() => {
    setIsClient(true);
    // استخدم doctorData بدلاً من doctorSession
    const doctorData = localStorage.getItem('doctorData'); 
    
    if (!doctorData) {
      router.push('/doctor/login');
    } else {
      // (اختياري) يمكنك تحميل بيانات الطبيب هنا لاستخدامها
      setDoctor(JSON.parse(doctorData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('doctorSession');
    router.push('/doctor/login');
  };

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">لوحة تحكم الطبيب</h1>
            <p className="text-green-100 mt-1">مرحباً بك في بوابة الأطباء</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الاستشارات المفتوحة</p>
                <p className="text-3xl font-bold text-gray-800">5</p>
              </div>
              <FileText className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">المواعيد اليوم</p>
                <p className="text-3xl font-bold text-gray-800">8</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">أيام الإجازة المتبقية</p>
                <p className="text-3xl font-bold text-gray-800">15</p>
              </div>
              <AlertCircle className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/doctor/consultations">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <FileText className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">الاستشارات</h3>
              <p className="text-gray-600">عرض والرد على الاستشارات الطبية</p>
            </div>
          </Link>

          <Link href="/doctor/attendance">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <Calendar className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">الحضور والانصراف</h3>
              <p className="text-gray-600">تقارير الحضور والانصراف</p>
            </div>
          </Link>

          <Link href="/doctor/leave-requests">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <AlertCircle className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">طلبات الإجازات</h3>
              <p className="text-gray-600">تقديم وتتبع طلبات الإجازات</p>
            </div>
          </Link>

          <Link href="/doctor/profile">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <FileText className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">البيانات الشخصية</h3>
              <p className="text-gray-600">عرض وتعديل البيانات الشخصية</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

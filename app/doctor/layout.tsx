'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedDoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // التحقق من وجود البيانات
    const checkAuth = () => {
      const doctorData = localStorage.getItem('doctorData');
      
      if (!doctorData) {
        // لا توجد بيانات -> طرد المستخدم لصفحة الدخول
        router.replace('/doctor/login');
      } else {
        // توجد بيانات -> السماح بالعرض
        try {
          const parsed = JSON.parse(doctorData);
          if (parsed && parsed.id) {
            setIsAuthorized(true);
          } else {
            throw new Error('بيانات تالفة');
          }
        } catch {
          localStorage.removeItem('doctorData');
          router.replace('/doctor/login');
        }
      }
    };

    checkAuth();
  }, [router]);

  // عرض شاشة تحميل أثناء التحقق
  if (!isAuthorized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return (
    <>
      {/* يمكنك هنا وضع الهيدر أو القائمة الجانبية المشتركة لجميع صفحات الطبيب */}
      {children}
    </>
  );
}

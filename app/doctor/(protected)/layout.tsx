'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // حالة تحميل لتجنب الوميض

  useEffect(() => {
    // التأكد من أننا في بيئة المتصفح
    if (typeof window === 'undefined') return;

    const checkAuth = () => {
      // 1. استثناء صفحة الدخول من الفحص
      if (pathname === '/doctor/login') {
        setIsLoading(false);
        return;
      }

      // 2. فحص الصفحات الداخلية (Dashboard, etc.)
      const doctorData = localStorage.getItem('doctorData');
      
      if (!doctorData) {
        // لا توجد بيانات -> توجيه ناعم لصفحة الدخول
        router.replace('/doctor/login');
      } else {
        // توجد بيانات -> تأكد أنها صالحة وليست تالفة
        try {
          const parsed = JSON.parse(doctorData);
          if (parsed && parsed.id) {
            setIsLoading(false); // البيانات سليمة، اسمح بالعرض
          } else {
            throw new Error('Invalid Data');
          }
        } catch (e) {
          // بيانات تالفة -> احذفها ووجه للدخول
          localStorage.removeItem('doctorData');
          router.replace('/doctor/login');
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  // أثناء التحقق، اعرض شاشة تحميل فقط (يمنع الوميض والتوجيه الخاطئ)
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          جاري التحقق...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

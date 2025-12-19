'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true); // حالة جديدة للتحقق
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // ننتظر حتى نتأكد أننا في المتصفح
    if (typeof window === 'undefined') return;

    const checkAuth = () => {
      // 1. هل نحن في صفحة الدخول؟
      if (pathname === '/doctor/login') {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // 2. فحص البيانات للصفحات الداخلية
      const doctorData = localStorage.getItem('doctorData');
      
      if (!doctorData) {
        // لا توجد بيانات -> توجيه لصفحة الدخول
        router.replace('/doctor/login');
      } else {
        // توجد بيانات -> السماح بالدخول
        setIsAuthorized(true);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // أثناء عملية التحقق، اعرض شاشة تحميل فقط
  if (isChecking) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">جاري التحقق...</div>
      </div>
    );
  }

  // إذا تم التحقق وكان مصرحاً له (أو هو في صفحة اللوجن)، اعرض المحتوى
  return <>{isAuthorized && children}</>;
}

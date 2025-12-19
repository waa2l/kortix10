'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedDoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // محاولة قراءة البيانات
    const doctorData = localStorage.getItem('doctorData');

    if (!doctorData) {
      // لا توجد بيانات -> اطرد المستخدم لصفحة الدخول فوراً
      router.replace('/doctor/login');
    } else {
      // توجد بيانات -> اسمح بالدخول
      setIsAuthorized(true);
    }
  }, [router]);

  // أثناء التحقق، لا تعرض شيئاً (شاشة بيضاء أفضل من الوميض)
  if (!isAuthorized) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* هنا سيتم عرض محتوى الصفحات الداخلية */}
      {children}
    </div>
  );
}

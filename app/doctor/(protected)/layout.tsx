'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. قراءة البيانات
    const doctorData = localStorage.getItem('doctorData');

    // 2. التحقق
    if (!doctorData) {
      // لا توجد بيانات؟ اطرد المستخدم فوراً لصفحة الدخول
      router.replace('/doctor/login');
    } else {
      // توجد بيانات؟ تأكد أنها صالحة (اختياري لكن مفضل)
      try {
        const parsed = JSON.parse(doctorData);
        if (parsed?.id) {
          setIsAuthorized(true);
        } else {
          throw new Error();
        }
      } catch {
        localStorage.removeItem('doctorData');
        router.replace('/doctor/login');
      }
    }
  }, [router]);

  // أثناء التحقق لا تعرض شيئاً لمنع الوميض
  if (!isAuthorized) {
    return null; // أو عرض spinner بسيط
  }

  return <>{children}</>;
}

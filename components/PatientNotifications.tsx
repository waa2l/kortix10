'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// يمكنك استخدام مكتبة تنبيهات مثل react-hot-toast أو sonner
// سنستخدم alert مؤقتاً أو كونسول، لكن يفضل تثبيت مكتبة toast
import { Toaster, toast } from 'sonner'; 

export default function PatientNotifications() {
  
  useEffect(() => {
    const setupListener = async () => {
      // 1. الحصول على معرف المستخدم الحالي للتأكد أن الإشعار يخصه
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. إعداد قناة الاستماع
      const channel = supabase
        .channel('patient-consultations')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'consultations',
            filter: `patient_id=eq.${user.id}`, // فلتر هام جداً: نستمع فقط للاستشارات الخاصة بهذا المريض
          },
          (payload: any) => {
            // التحقق أن الحالة تغيرت إلى completed
            if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
              
              // تشغيل صوت (اختياري)
              const audio = new Audio('/sounds/notification.mp3'); // تأكد من وجود ملف صوتي في مجلد public
              audio.play().catch(() => {});

              // إظهار الإشعار
              toast.success('تم الرد على استشارتك الطبية!', {
                description: 'اضغط هنا لعرض الرد والروشتة',
                duration: 5000,
                action: {
                  label: 'عرض',
                  onClick: () => window.location.href = `/patient/consultations/${payload.new.id}`
                }
              });
            }
          }
        )
        .subscribe();

      // تنظيف القناة عند الخروج
      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupListener();
  }, []);

  // نقوم بإرجاع عنصر Toaster لكي تظهر التنبيهات على الشاشة
  return <Toaster position="top-center" richColors />;
}

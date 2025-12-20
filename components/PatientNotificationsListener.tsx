'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { playAudio } from '@/lib/utils';

export default function PatientNotificationsListener() {
  const router = useRouter();

  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('global-patient-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'consultations',
            filter: `patient_id=eq.${user.id}`,
          },
          (payload: any) => {
            if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
              playAudio('/audio/ding.mp3').catch(() => {});
              toast.success('تم الرد على استشارتك الطبية!', {
                description: 'اضغط هنا لعرض الرد والروشتة',
                duration: 8000,
                position: 'top-center',
                action: {
                  label: 'عرض الرد',
                  onClick: () => router.push(`/patient/consultations/${payload.new.id}`)
                }
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [router]);

  return <Toaster position="top-center" richColors />;
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useQueue } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, Play, RotateCcw, AlertTriangle, Send, Pause, Bell, MessageSquare, X } from 'lucide-react';
import { toArabicNumbers, playSequentialAudio, playAudio } from '@/lib/utils';

export default function ControlPanel() {
  const router = useRouter();
  
  // Hooks
  const { clinics, loading: clinicsLoading, updateClinic } = useClinics();
  const { addToQueue } = useQueue();
  
  // States
  const [isClient, setIsClient] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ show: boolean; message: string; type?: 'normal' | 'emergency' | 'message' } | null>(null);
  
  // Text Alert Modal State
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgTargetClinic, setMsgTargetClinic] = useState('');
  const [msgContent, setMsgContent] = useState('');

  // Refs
  const prevClinicsRef = useRef<typeof clinics>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Realtime Logic ---

  // 1. مراقبة تحديثات العيادات (للأزرار والنداءات)
  useEffect(() => {
    if (!isAuthenticated || clinicsLoading) return;

    clinics.forEach((clinic) => {
      const prevClinic = prevClinicsRef.current.find((c) => c.id === clinic.id);
      
      // الكشف عن نداء جديد
      if (prevClinic && clinic.last_call_time !== prevClinic.last_call_time && clinic.last_call_time) {
        const callTime = new Date(clinic.last_call_time).getTime();
        const now = new Date().getTime();
        
        if (now - callTime < 10000) {
          triggerControlAlert(
            `تم نداء رقم ${toArabicNumbers(clinic.current_number)} - ${clinic.clinic_name}`,
            'normal',
            ['/audio/ding.mp3', `/audio/${clinic.current_number}.mp3`, `/audio/clinic${clinic.clinic_number}.mp3`]
          );
        }
      }
    });

    prevClinicsRef.current = clinics;
  }, [clinics, isAuthenticated]);

  // 2. مراقبة رسائل التنبيه النصي (Broadcast)
  useEffect(() => {
    if (!isAuthenticated || !selectedClinic) return;

    const channel = supabase.channel('clinic-alerts');
    
    channel
      .on('broadcast', { event: 'clinic-message' }, (payload) => {
        if (payload.payload.targetClinicId === selectedClinic) {
          triggerControlAlert(
            `رسالة من ${payload.payload.senderName}: ${payload.payload.message}`,
            'message',
            ['/audio/ding.mp3']
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClinic, isAuthenticated]);


  const triggerControlAlert = async (message: string, type: 'normal' | 'emergency' | 'message' = 'normal', audioFiles: string[] = []) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(null), 8000);

    if (audioFiles.length > 0) {
      try {
        await playSequentialAudio(audioFiles);
      } catch (e) { console.error("Audio error", e); }
    }
  };

  // --- Handlers ---

  const handleToggleActive = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic) {
      try {
        await updateClinic(clinic.id, { is_active: !clinic.is_active });
        triggerControlAlert(
          `تم ${!clinic.is_active ? 'تفعيل' : 'إيقاف'} العيادة بنجاح`,
          'normal'
        );
      } catch (err) {
        alert('حدث خطأ في تغيير حالة العيادة');
      }
    }
  };

  const handleNextPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.is_active) {
      try {
        const newNumber = clinic.current_number + 1;
        await updateClinic(clinic.id, { 
          current_number: newNumber,
          last_call_time: new Date().toISOString()
        });
      } catch (err) { alert('فشل التحديث'); }
    } else {
      alert('العيادة متوقفة حالياً، يرجى تفعيلها أولاً');
    }
  };

  const handlePreviousPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
      try {
        await updateClinic(clinic.id, { 
          current_number: clinic.current_number - 1 
        });
      } catch (err) { alert('فشل التحديث'); }
    }
  };

  const handleRepeatCall = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
       try {
          await updateClinic(clinic.id, { 
            last_call_time: new Date().toISOString() 
          });
        } catch (err) { alert('فشل التحديث'); }
    }
  };

  const handleReset = async () => {
    if (confirm('هل أنت متأكد من تصفير عداد العيادة؟')) {
      const clinic = clinics.find((c) => c.id === selectedClinic);
      if (clinic) {
        try {
          await updateClinic(clinic.id, { 
            current_number: 0,
            last_call_time: null
          });
        } catch (err) { alert('فشل التصفير'); }
      }
    }
  };

  const handleEmergency = async () => {
    if (confirm('تأكيد نداء الطوارئ؟ سيتم إيقاف جميع الشاشات وعرض التنبيه.')) {
      const clinic = clinics.find((c) => c.id === selectedClinic);
      if (clinic) {
        try {
          // تم التصحيح هنا بإضافة الحقول المفقودة
          await addToQueue({
            clinic_id: clinic.id,
            ticket_number: clinic.current_number, 
            status: 'called',
            is_emergency: true,
            patient_id: null,
            called_at: new Date().toISOString(),
            completed_at: null
          });

          triggerControlAlert('تم إطلاق نداء الطوارئ!', 'emergency', ['/audio/emergency.mp3']);
          
        } catch (err) {
          console.error(err);
          alert('فشل إرسال نداء الطوارئ');
        }
      }
    }
  };

  const handleSendTextAlert = async () => {
    if (!msgTargetClinic || !msgContent) return;
    
    const currentClinic = clinics.find(c => c.id === selectedClinic);
    
    try {
      const channel = supabase.channel('clinic-alerts');
      await channel.send({
        type: 'broadcast',
        event: 'clinic-message',
        payload: {
          targetClinicId: msgTargetClinic,
          senderName: currentClinic?.clinic_name || 'عيادة',
          message: msgContent
        }
      });
      
      setShowMsgModal(false);
      setMsgContent('');
      alert('تم إرسال الرسالة بنجاح');
    } catch (err) {
      alert('فشل الإرسال');
    }
  };

  // Auth Handlers
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (!clinic) return setError('اختر العيادة');
    if (password === clinic.control_password) {
      setIsAuthenticated(true);
      setError('');
      prevClinicsRef.current = clinics;
    } else {
      setError('كلمة المرور خاطئة');
    }
  };

  // --- UI ---

  if (!isClient || clinicsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="spinner mb-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-cairo">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <h1 className="text-3xl font-bold text-white text-center mb-6">لوحة التحكم</h1>
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-center">{error}</div>}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">-- اختر عيادة --</option>
              {clinics.map((c) => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
            </select>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  const clinic = clinics.find((c) => c.id === selectedClinic);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative font-cairo overflow-hidden">
      
      {/* Notification Bar */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-300 ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`p-4 shadow-lg flex items-center justify-center gap-3 ${
          notification?.type === 'emergency' ? 'bg-red-600' : 
          notification?.type === 'message' ? 'bg-purple-600' : 'bg-green-600'
        }`}>
          <Bell className="w-6 h-6 text-white animate-bounce" />
          <p className="text-xl font-bold">{notification?.message}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            {clinic?.clinic_name}
            {!clinic?.is_active && <span className="bg-red-500 text-xs px-2 py-1 rounded">متوقفة</span>}
          </h1>
          <p className="text-gray-400 text-lg">الرقم الحالي: <span className="text-blue-400 font-bold text-2xl">{toArabicNumbers(clinic?.current_number || 0)}</span></p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="mt-4 md:mt-0 flex items-center gap-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-6 py-2 rounded-lg transition-all">
          <LogOut className="w-5 h-5" /> تسجيل الخروج
        </button>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <button onClick={handleNextPatient} disabled={!clinic?.is_active} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed p-8 rounded-xl flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg border-b-4 border-green-800">
          <Play className="w-12 h-12" />
          <span className="text-2xl font-bold">العميل التالي</span>
        </button>

        <button onClick={handlePreviousPatient} disabled={!clinic?.is_active} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-8 rounded-xl flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg border-b-4 border-blue-800">
          <RotateCcw className="w-12 h-12" />
          <span className="text-2xl font-bold">العميل السابق</span>
        </button>

        <button onClick={handleRepeatCall} disabled={!clinic?.is_active} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed p-8 rounded-xl flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg border-b-4 border-purple-800">
          <Bell className="w-12 h-12" />
          <span className="text-2xl font-bold">تكرار النداء</span>
        </button>

        <button onClick={handleToggleActive} className={`${clinic?.is_active ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-800' : 'bg-gray-600 hover:bg-gray-500 border-gray-700'} p-8 rounded-xl flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg border-b-4`}>
          <Pause className="w-12 h-12" />
          <span className="text-2xl font-bold">{clinic?.is_active ? 'إيقاف العيادة' : 'استئناف العيادة'}</span>
        </button>

        <button onClick={handleReset} className="bg-orange-600 hover:bg-orange-700 p-8 rounded-xl flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg border-b-4 border-orange-800">
          <RotateCcw className="w-12 h-12" />
          <span className="text-2xl font-bold">تصفير العداد</span>
        </button>

        <button onClick={handleEmergency} className="bg-red-600 hover:bg-red-700 p-8 rounded-xl flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg border-b-4 border-red-800 animate-pulse-glow">
          <AlertTriangle className="w-12 h-12" />
          <span className="text-2xl font-bold">نداء طوارئ</span>
        </button>
      </div>

      {/* Extra Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-blue-400"/> نداء خاص</h3>
          <div className="flex gap-2">
            <input type="number" placeholder="رقم العميل" className="flex-1 bg-gray-700 border-gray-600 rounded-lg px-4 text-white" />
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold">نداء</button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-400"/> تنبيه نصي لعيادة</h3>
          <button onClick={() => setShowMsgModal(true)} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold">إرسال رسالة</button>
        </div>
      </div>

      {/* Modal for Text Alert */}
      {showMsgModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-lg border border-gray-700 relative">
            <button onClick={() => setShowMsgModal(false)} className="absolute top-4 left-4 text-gray-400 hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold mb-6">إرسال تنبيه نصي</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">إلى عيادة</label>
                <select value={msgTargetClinic} onChange={(e) => setMsgTargetClinic(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg px-4 py-3">
                  <option value="">-- اختر عيادة --</option>
                  {clinics.filter(c => c.id !== selectedClinic).map(c => (
                    <option key={c.id} value={c.id}>{c.clinic_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">الرسالة</label>
                <textarea value={msgContent} onChange={(e) => setMsgContent(e.target.value)} rows={3} className="w-full bg-gray-700 border-gray-600 rounded-lg px-4 py-3" placeholder="اكتب رسالتك هنا..."></textarea>
              </div>

              <button onClick={handleSendTextAlert} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

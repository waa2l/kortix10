'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useQueue } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, Play, RotateCcw, AlertTriangle, Send, Pause, Bell, MessageSquare, X, ArrowRightLeft, Clock } from 'lucide-react';
import { toArabicNumbers, playSequentialAudio, getArabicDate, getArabicTime } from '@/lib/utils';

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
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Notification State (Updated: 3 Seconds)
  const [notification, setNotification] = useState<{ show: boolean; message: string; type?: 'normal' | 'emergency' | 'message' | 'transfer' } | null>(null);
  
  // Inputs State
  const [specialCallNumber, setSpecialCallNumber] = useState('');
  
  // Modals State
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Modal Data
  const [msgTargetClinic, setMsgTargetClinic] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [transferTargetClinic, setTransferTargetClinic] = useState('');

  // Refs
  const prevClinicsRef = useRef<typeof clinics>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Time Updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Realtime Logic (Listening) ---

  useEffect(() => {
    if (!isAuthenticated || clinicsLoading) return;

    clinics.forEach((clinic) => {
      const prevClinic = prevClinicsRef.current.find((c) => c.id === clinic.id);
      
      if (prevClinic && clinic.last_call_time !== prevClinic.last_call_time && clinic.last_call_time) {
        const callTime = new Date(clinic.last_call_time).getTime();
        const now = new Date().getTime();
        
        if (now - callTime < 5000) {
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase.channel('control-alerts');
    
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
      .on('broadcast', { event: 'clinic-transfer' }, (payload) => {
        if (payload.payload.fromClinicId === selectedClinic || payload.payload.toClinicId === selectedClinic) {
           triggerControlAlert(
            `تحويل العميل ${toArabicNumbers(payload.payload.ticketNumber)} إلى ${payload.payload.toClinicName}`,
            'transfer',
            ['/audio/ding.mp3']
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClinic, isAuthenticated]);


  // دالة التنبيه الموحدة (تم تعديل الوقت لـ 3 ثواني)
  const triggerControlAlert = async (message: string, type: 'normal' | 'emergency' | 'message' | 'transfer' = 'normal', audioFiles: string[] = []) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(null), 3000); // 3 Seconds

    if (audioFiles.length > 0) {
      try {
        await playSequentialAudio(audioFiles);
      } catch (e) { console.error("Audio error", e); }
    }
  };

  // --- Handlers (With Feedback) ---

  const handleNextPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.is_active) {
      try {
        await updateClinic(clinic.id, { 
          current_number: clinic.current_number + 1,
          last_call_time: new Date().toISOString()
        });
        // Feedback handled by realtime listener
      } catch (err) { triggerControlAlert('فشل التحديث', 'normal', ['/audio/ding.mp3']); }
    } else {
      triggerControlAlert('العيادة متوقفة حالياً', 'normal', ['/audio/ding.mp3']);
    }
  };

  const handlePreviousPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
      try {
        await updateClinic(clinic.id, { 
          current_number: clinic.current_number - 1 
        });
        triggerControlAlert('تم الرجوع للعميل السابق', 'normal', ['/audio/ding.mp3']);
      } catch (err) { alert('فشل التحديث'); }
    }
  };

  const handleRepeatCall = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
       try {
          await updateClinic(clinic.id, { last_call_time: new Date().toISOString() });
          // Feedback handled by realtime listener
        } catch (err) { alert('فشل التحديث'); }
    }
  };

  const handleSpecialCall = async () => {
    if (!specialCallNumber) return;
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic) {
      try {
        await updateClinic(clinic.id, { 
          current_number: parseInt(specialCallNumber),
          last_call_time: new Date().toISOString()
        });
        setSpecialCallNumber('');
        // Feedback handled by realtime listener
      } catch (err) { alert('فشل النداء الخاص'); }
    }
  };

  const handleTransferCurrent = async () => {
    if (!transferTargetClinic) return;
    const currentClinic = clinics.find(c => c.id === selectedClinic);
    const targetClinicObj = clinics.find(c => c.id === transferTargetClinic);
    
    if (currentClinic && targetClinicObj) {
      try {
        const channel = supabase.channel('control-alerts');
        await channel.send({
          type: 'broadcast',
          event: 'clinic-transfer',
          payload: {
            ticketNumber: currentClinic.current_number,
            fromClinicId: currentClinic.id,
            toClinicId: targetClinicObj.id,
            toClinicName: targetClinicObj.clinic_name,
            toClinicNumber: targetClinicObj.clinic_number
          }
        });
        setShowTransferModal(false);
        setTransferTargetClinic('');
        // Feedback handled by realtime listener
      } catch (err) {
        alert('فشل التحويل');
      }
    }
  };

  const handleEmergency = async () => {
    if (confirm('تأكيد نداء الطوارئ؟')) {
      const clinic = clinics.find((c) => c.id === selectedClinic);
      if (clinic) {
        try {
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
        } catch (err) { alert('فشل إرسال نداء الطوارئ'); }
      }
    }
  };

  const handleSendTextAlert = async () => {
    if (!msgTargetClinic || !msgContent) return;
    const currentClinic = clinics.find(c => c.id === selectedClinic);
    try {
      const channel = supabase.channel('control-alerts');
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
      triggerControlAlert('تم إرسال الرسالة', 'normal', ['/audio/ding.mp3']);
    } catch (err) { alert('فشل الإرسال'); }
  };

  const handleReset = async () => {
    if (confirm('تصفير العداد؟')) {
      const clinic = clinics.find((c) => c.id === selectedClinic);
      if (clinic) {
        await updateClinic(clinic.id, { current_number: 0, last_call_time: null });
        triggerControlAlert('تم تصفير العداد', 'normal', ['/audio/ding.mp3']);
      }
    }
  };

  const handleToggleActive = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic) {
      await updateClinic(clinic.id, { is_active: !clinic.is_active });
      triggerControlAlert(
        `تم ${!clinic.is_active ? 'تفعيل' : 'إيقاف'} العيادة`, 
        'normal', 
        ['/audio/ding.mp3']
      );
    }
  };

  // Auth
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

  // --- Render ---

  if (!isClient || clinicsLoading) return <div className="flex items-center justify-center min-h-screen bg-gray-900"><div className="spinner mb-4 border-white border-t-transparent"></div></div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-cairo">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <h1 className="text-3xl font-bold text-white text-center mb-6">لوحة التحكم</h1>
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-center">{error}</div>}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <select value={selectedClinic} onChange={(e) => setSelectedClinic(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="">-- اختر عيادة --</option>
              {clinics.map((c) => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
            </select>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  const clinic = clinics.find((c) => c.id === selectedClinic);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative font-cairo overflow-hidden">
      
      {/* Header with Date/Time */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-white">{clinic?.clinic_name}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <Clock className="w-4 h-4" />
              <span>{getArabicTime(currentTime)}</span>
              <span>-</span>
              <span>{getArabicDate(currentTime)}</span>
            </div>
          </div>
          {!clinic?.is_active && <span className="bg-red-500 text-xs px-2 py-1 rounded self-start mt-1">متوقفة</span>}
        </div>
        
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <div className="text-center bg-gray-700 px-6 py-2 rounded-lg">
            <p className="text-xs text-gray-400">الرقم الحالي</p>
            <p className="text-3xl font-bold text-blue-400">{toArabicNumbers(clinic?.current_number || 0)}</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition-all text-sm">
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </div>

      {/* Notification Bar (3 Seconds) */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-300 ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`p-4 shadow-lg flex items-center justify-center gap-3 ${
          notification?.type === 'emergency' ? 'bg-red-600' : 
          notification?.type === 'message' ? 'bg-purple-600' : 
          notification?.type === 'transfer' ? 'bg-indigo-600' : 'bg-green-600'
        }`}>
          <Bell className="w-6 h-6 text-white animate-bounce" />
          <p className="text-xl font-bold">{notification?.message}</p>
        </div>
      </div>

      {/* Grid Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <button onClick={handleNextPatient} disabled={!clinic?.is_active} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 p-8 rounded-xl flex flex-col items-center gap-3 shadow-lg border-b-4 border-green-800 transition-transform active:scale-95">
          <Play className="w-12 h-12" />
          <span className="text-2xl font-bold">العميل التالي</span>
        </button>

        <button onClick={handlePreviousPatient} disabled={!clinic?.is_active} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 p-8 rounded-xl flex flex-col items-center gap-3 shadow-lg border-b-4 border-blue-800 transition-transform active:scale-95">
          <RotateCcw className="w-12 h-12" />
          <span className="text-2xl font-bold">العميل السابق</span>
        </button>

        <button onClick={handleRepeatCall} disabled={!clinic?.is_active} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-8 rounded-xl flex flex-col items-center gap-3 shadow-lg border-b-4 border-purple-800 transition-transform active:scale-95">
          <Bell className="w-12 h-12" />
          <span className="text-2xl font-bold">تكرار النداء</span>
        </button>

        {/* Transfer Button */}
        <button onClick={() => setShowTransferModal(true)} disabled={!clinic?.is_active} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 p-8 rounded-xl flex flex-col items-center gap-3 shadow-lg border-b-4 border-indigo-800 transition-transform active:scale-95">
          <ArrowRightLeft className="w-12 h-12" />
          <span className="text-2xl font-bold">تحويل العميل الحالي</span>
        </button>

        <button onClick={handleToggleActive} className={`${clinic?.is_active ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-800' : 'bg-gray-600 hover:bg-gray-500 border-gray-700'} p-8 rounded-xl flex flex-col items-center gap-3 shadow-lg border-b-4 transition-transform active:scale-95`}>
          <Pause className="w-12 h-12" />
          <span className="text-2xl font-bold">{clinic?.is_active ? 'إيقاف العيادة' : 'استئناف العيادة'}</span>
        </button>

        <button onClick={handleReset} className="bg-orange-600 hover:bg-orange-700 p-8 rounded-xl flex flex-col items-center gap-3 shadow-lg border-b-4 border-orange-800 transition-transform active:scale-95">
          <RotateCcw className="w-12 h-12" />
          <span className="text-2xl font-bold">تصفير العداد</span>
        </button>

        <button onClick={handleEmergency} className="bg-red-600 hover:bg-red-700 p-8 rounded-xl flex flex-col items-center gap-3 shadow-lg border-b-4 border-red-800 animate-pulse-glow col-span-1 md:col-span-2 lg:col-span-3">
          <AlertTriangle className="w-12 h-12" />
          <span className="text-2xl font-bold">نداء طوارئ</span>
        </button>
      </div>

      {/* Extra Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-blue-400"/> نداء خاص</h3>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={specialCallNumber}
              onChange={(e) => setSpecialCallNumber(e.target.value)}
              placeholder="رقم العميل" 
              className="flex-1 bg-gray-700 border-gray-600 rounded-lg px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
            />
            <button onClick={handleSpecialCall} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold">نداء</button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-400"/> تنبيه نصي لعيادة</h3>
          <button onClick={() => setShowMsgModal(true)} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold">إرسال رسالة</button>
        </div>
      </div>

      {/* Message Modal */}
      {showMsgModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-lg border border-gray-700 relative">
            <button onClick={() => setShowMsgModal(false)} className="absolute top-4 left-4 text-gray-400 hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold mb-6">إرسال تنبيه نصي</h2>
            <div className="space-y-4">
              <select value={msgTargetClinic} onChange={(e) => setMsgTargetClinic(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg px-4 py-3">
                <option value="">-- اختر العيادة --</option>
                {clinics.filter(c => c.id !== selectedClinic).map(c => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
              </select>
              <textarea value={msgContent} onChange={(e) => setMsgContent(e.target.value)} rows={3} className="w-full bg-gray-700 border-gray-600 rounded-lg px-4 py-3" placeholder="الرسالة..."></textarea>
              <button onClick={handleSendTextAlert} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg">إرسال</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-lg border border-gray-700 relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute top-4 left-4 text-gray-400 hover:text-white"><X /></button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ArrowRightLeft className="text-indigo-500"/> تحويل العميل الحالي</h2>
            <div className="bg-indigo-900/30 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
              <p className="text-gray-400">العميل الحالي رقم:</p>
              <p className="text-4xl font-bold text-white mt-2">{clinic?.current_number}</p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm text-gray-400">إلى عيادة:</label>
              <select value={transferTargetClinic} onChange={(e) => setTransferTargetClinic(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg px-4 py-3">
                <option value="">-- اختر العيادة --</option>
                {clinics.filter(c => c.id !== selectedClinic).map(c => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
              </select>
              <button onClick={handleTransferCurrent} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg mt-4">تأكيد التحويل</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

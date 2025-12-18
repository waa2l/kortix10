'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useQueue } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, Play, RotateCcw, AlertTriangle, Send, Pause, Bell, MessageSquare, X, ArrowRightLeft, Clock, Mic, StopCircle } from 'lucide-react';
import { toArabicNumbers, playSequentialAudio, getArabicDate, getArabicTime, playAudio } from '@/lib/utils';

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
  
  // Notification State
  const [notification, setNotification] = useState<{ show: boolean; message: string; type?: 'normal' | 'emergency' | 'message' | 'transfer' } | null>(null);
  
  // Inputs State
  const [specialCallNumber, setSpecialCallNumber] = useState('');
  const [patientName, setPatientName] = useState(''); 
  
  // Emergency Loop State
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const emergencyAudioRef = useRef<HTMLAudioElement | null>(null);

  // Modals State
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Modal Data
  const [msgTargetClinic, setMsgTargetClinic] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [transferTargetClinic, setTransferTargetClinic] = useState('');

  const prevClinicsRef = useRef<typeof clinics>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Realtime Logic ---
  // تم تبسيط هذا الجزء ليستمع فقط للرسائل الخارجية، لأن الأزرار ستقوم بتشغيل الصوت محلياً
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClinic, isAuthenticated]);


  // دالة مساعدة لتجهيز ملفات الصوت للجملة الكاملة
  const getFullAudioFiles = (ticketNumber: number, clinicNumber: number) => {
    return [
      '/audio/ding.mp3', 
      `/audio/${ticketNumber}.mp3`, 
      `/audio/clinic${clinicNumber}.mp3`
    ];
  };

  // دالة التنبيه الموحدة
  const triggerControlAlert = async (message: string, type: 'normal' | 'emergency' | 'message' | 'transfer' = 'normal', audioFiles: string[] = []) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(null), 3000);

    // تشغيل الصوت فوراً
    if (audioFiles.length > 0) {
      try {
        await playSequentialAudio(audioFiles);
      } catch (e) { console.error("Audio error", e); }
    }
  };

  // --- Handlers ---

  // 1. العميل التالي (تم التعديل: ينطق الجملة كاملة)
  const handleNextPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.is_active) {
      const nextNumber = clinic.current_number + 1;
      try {
        // تحديث قاعدة البيانات
        await updateClinic(clinic.id, { 
          current_number: nextNumber,
          last_call_time: new Date().toISOString()
        });
        
        // نطق الجملة كاملة محلياً
        triggerControlAlert(
          `تم نداء رقم ${toArabicNumbers(nextNumber)}`, 
          'normal', 
          getFullAudioFiles(nextNumber, clinic.clinic_number)
        );

      } catch (err) { triggerControlAlert('فشل التحديث', 'normal', ['/audio/ding.mp3']); }
    } else {
      triggerControlAlert('العيادة متوقفة حالياً', 'normal', ['/audio/ding.mp3']);
    }
  };

  // 2. العميل السابق (تم التعديل: ينطق الجملة كاملة بدلاً من ding فقط)
  const handlePreviousPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
      const prevNumber = clinic.current_number - 1;
      try {
        await updateClinic(clinic.id, { 
          current_number: prevNumber 
        });
        
        // نطق الجملة كاملة
        triggerControlAlert(
          `تم الرجوع لرقم ${toArabicNumbers(prevNumber)}`, 
          'normal', 
          getFullAudioFiles(prevNumber, clinic.clinic_number)
        );
      } catch (err) { alert('فشل التحديث'); }
    }
  };

  // 3. تكرار النداء (تم التعديل: ينطق الجملة كاملة)
  const handleRepeatCall = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
       try {
         await updateClinic(clinic.id, { last_call_time: new Date().toISOString() });
         
         // نطق الجملة كاملة
         triggerControlAlert(
            `تكرار نداء رقم ${toArabicNumbers(clinic.current_number)}`, 
            'normal', 
            getFullAudioFiles(clinic.current_number, clinic.clinic_number)
         );
       } catch (err) { alert('فشل التحديث'); }
    }
  };

  // 4. نداء برقم محدد (تم التعديل: ينطق الجملة كاملة)
  const handleSpecialCall = async () => {
    if (!specialCallNumber) return;
    const targetNum = parseInt(specialCallNumber);
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic) {
      try {
        await updateClinic(clinic.id, { 
          current_number: targetNum,
          last_call_time: new Date().toISOString()
        });
        
        // نطق الجملة كاملة
        triggerControlAlert(
            `نداء خاص لرقم ${toArabicNumbers(targetNum)}`, 
            'normal', 
            getFullAudioFiles(targetNum, clinic.clinic_number)
        );
        setSpecialCallNumber('');
      } catch (err) { alert('فشل النداء الخاص'); }
    }
  };

  // 5. نداء باسم (ding فقط كما هو)
  const handleNameAlert = async () => {
    if (!patientName) return;
    const clinic = clinics.find(c => c.id === selectedClinic);
    
    try {
      const channel = supabase.channel('control-alerts');
      await channel.send({
        type: 'broadcast',
        event: 'name-alert',
        payload: {
          name: patientName,
          clinicName: clinic?.clinic_name || 'العيادة'
        }
      });
      triggerControlAlert(`جاري نداء: ${patientName}`, 'normal', ['/audio/ding.mp3']);
      setPatientName(''); 
    } catch (err) { alert('فشل الإرسال'); }
  };

  // 6. التحويل (تم التعديل: نطق ding)
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
        
        // تشغيل صوت تأكيد التحويل
        triggerControlAlert(
            `تم التحويل إلى ${targetClinicObj.clinic_name}`, 
            'transfer', 
            ['/audio/ding.mp3']
        );
        
        setShowTransferModal(false);
        setTransferTargetClinic('');
      } catch (err) { alert('فشل التحويل'); }
    }
  };

  // 7. الطوارئ (تم التعديل: تشغيل مستمر Loop)
  const handleEmergencyToggle = async () => {
    // إذا كانت الطوارئ تعمل بالفعل -> إيقاف
    if (isEmergencyActive) {
      if (emergencyAudioRef.current) {
        emergencyAudioRef.current.pause();
        emergencyAudioRef.current.currentTime = 0;
      }
      setIsEmergencyActive(false);
      setNotification(null);
      return;
    }

    // إذا كانت الطوارئ متوقفة -> تشغيل
    if (confirm('تأكيد نداء الطوارئ؟')) {
      const clinic = clinics.find((c) => c.id === selectedClinic);
      if (clinic) {
        try {
          // إرسال للشاشة
          await addToQueue({
            clinic_id: clinic.id,
            ticket_number: clinic.current_number, 
            status: 'called',
            is_emergency: true,
            patient_id: null,
            called_at: new Date().toISOString(),
            completed_at: null
          });

          // تشغيل الصوت Loop محلياً
          setIsEmergencyActive(true);
          setNotification({ show: true, message: '⚠️ نداء الطوارئ مفعل ⚠️', type: 'emergency' });
          
          if (!emergencyAudioRef.current) {
            emergencyAudioRef.current = new Audio('/audio/emergency.mp3');
            emergencyAudioRef.current.loop = true; // تفعيل التكرار
          }
          emergencyAudioRef.current.play().catch(e => console.error("Emergency play error", e));

        } catch (err) { alert('فشل إرسال نداء الطوارئ'); }
      }
    }
  };

  // تنظيف صوت الطوارئ عند الخروج من الصفحة
  useEffect(() => {
    return () => {
      if (emergencyAudioRef.current) {
        emergencyAudioRef.current.pause();
      }
    };
  }, []);

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
      
      {/* Header */}
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

      {/* Notification Bar */}
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

        {/* Emergency Toggle Button */}
        <button 
            onClick={handleEmergencyToggle} 
            className={`${isEmergencyActive ? 'bg-gray-700 hover:bg-gray-600 border-gray-900' : 'bg-red-600 hover:bg-red-700 border-red-800'} p-8 rounded-xl flex flex-col items-center gap-3 shadow-lg border-b-4 transition-transform active:scale-95 col-span-1 md:col-span-2 lg:col-span-3 ${isEmergencyActive ? '' : 'animate-pulse-glow'}`}
        >
          {isEmergencyActive ? <StopCircle className="w-12 h-12 text-red-500" /> : <AlertTriangle className="w-12 h-12" />}
          <span className="text-2xl font-bold">{isEmergencyActive ? 'إيقاف صوت الطوارئ' : 'نداء طوارئ'}</span>
        </button>

      </div>

      {/* Extra Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* نداء خاص برقم */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-blue-400"/> نداء برقم محدد</h3>
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

        {/* نداء باسم (جديد) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Mic className="w-5 h-5 text-green-400"/> نداء باسم العميل</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="اسم العميل" 
              className="flex-1 bg-gray-700 border-gray-600 rounded-lg px-4 text-white focus:ring-2 focus:ring-green-500 outline-none" 
            />
            <button onClick={handleNameAlert} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold">نداء</button>
          </div>
        </div>

        {/* رسالة لعيادة أخرى */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col justify-center">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5 text-purple-400"/> تنبيه نصي لعيادة</h3>
          <button onClick={() => setShowMsgModal(true)} className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold">إرسال رسالة</button>
        </div>

      </div>

      {/* Modals */}
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

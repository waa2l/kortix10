'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings, useDoctors } from '@/lib/hooks'; 
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, Maximize, Minimize, Volume2, VolumeX, Bell, Activity, Ban, Clock, User, ZoomIn, ZoomOut, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { toArabicNumbers, getArabicDate, getArabicTime, playSequentialAudio, playAudio } from '@/lib/utils'; 

export default function DisplayScreen() {
  const router = useRouter();
  
  const { clinics, loading: clinicsLoading } = useClinics();
  const { doctors } = useDoctors(); 
  const { settings } = useSettings();

  const [isClient, setIsClient] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(1);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  
  // Notification State
  const [notification, setNotification] = useState<{ 
    show: boolean; 
    message: string; 
    type: 'normal' | 'emergency' | 'transfer';
    targetClinicId?: string; // لتحديد العيادة التي ستومض
  } | null>(null);
  
  const prevClinicsRef = useRef<typeof clinics>([]);
  const isFirstLoad = useRef(true);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (doctors.length > 0) {
      const doctorTimer = setInterval(() => {
        setCurrentDoctorIndex((prev) => (prev + 1) % doctors.length);
      }, 10000); 
      return () => clearInterval(doctorTimer);
    }
  }, [doctors]);

  // --- Realtime Listeners ---

  useEffect(() => {
    if (!isAuthenticated) return;

    // A. قناة الطوارئ
    const queueChannel = supabase.channel('display-queue')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'queue', filter: 'is_emergency=eq.true' },
        (payload) => {
          const clinicName = clinics.find(c => c.id === payload.new.clinic_id)?.clinic_name || 'العيادة';
          triggerEmergency(clinicName);
        }
      )
      .subscribe();

    // B. قناة التحويلات
    const alertChannel = supabase.channel('control-alerts')
      .on('broadcast', { event: 'clinic-transfer' }, (payload) => {
        triggerTransferAlert(payload.payload);
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(queueChannel); 
      supabase.removeChannel(alertChannel);
    };
  }, [isAuthenticated, clinics]);

  useEffect(() => {
    if (!isAuthenticated || clinicsLoading) return;

    if (isFirstLoad.current && clinics.length > 0) {
      prevClinicsRef.current = clinics;
      isFirstLoad.current = false;
      return;
    }

    clinics.forEach((clinic) => {
      const prevClinic = prevClinicsRef.current.find((c) => c.id === clinic.id);
      
      if (prevClinic && clinic.last_call_time !== prevClinic.last_call_time && clinic.last_call_time) {
          if (notification?.type !== 'emergency') {
            triggerAlert(clinic);
          }
      }
    });

    prevClinicsRef.current = clinics;
  }, [clinics, isAuthenticated, isMuted, clinicsLoading]);

  // --- Trigger Functions ---

  const triggerEmergency = async (clinicName: string) => {
    setNotification({
      show: true,
      message: `⚠️ طوارئ: يرجى إخلاء الطريق لـ ${clinicName} ⚠️`,
      type: 'emergency'
    });
    if (!isMuted) await playAudio('/audio/emergency.mp3').catch(console.error);
    setTimeout(() => setNotification(null), 15000);
  };

  const triggerTransferAlert = async (data: any) => {
    setNotification({
      show: true,
      message: `( تحويل ) العميل رقم ${toArabicNumbers(data.ticketNumber)} التوجه إلى ${data.toClinicName}`,
      type: 'transfer',
      targetClinicId: data.toClinicId
    });

    if (!isMuted) {
      const audioFiles = [
        '/audio/ding.mp3',
        `/audio/${data.ticketNumber}.mp3`,
        `/audio/clinic${data.toClinicNumber}.mp3`
      ];
      try { await playSequentialAudio(audioFiles); } catch (e) { console.error(e); }
    }
    setTimeout(() => setNotification(null), 10000);
  };

  const triggerAlert = async (clinic: any) => {
    setNotification({
      show: true,
      message: `العميل رقم ${toArabicNumbers(clinic.current_number)} التوجه إلى ${clinic.clinic_name}`,
      type: 'normal',
      targetClinicId: clinic.id
    });

    if (!isMuted) {
      const audioFiles = [
        '/audio/ding.mp3',
        `/audio/${clinic.current_number}.mp3`,
        `/audio/clinic${clinic.clinic_number}.mp3`
      ];
      try { await playSequentialAudio(audioFiles); } catch (e) { console.error(e); }
    }
    setTimeout(() => setNotification(null), 10000);
  };

  // --- UI Handlers ---
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'screen123') { setIsAuthenticated(true); setPassword(''); } 
    else { alert('كلمة المرور غير صحيحة'); }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); } 
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  if (!isClient || clinicsLoading) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 text-white"><div className="spinner mb-4 border-white border-t-transparent"></div></div>;
  
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full text-white">
        <h1 className="text-3xl font-bold text-center mb-8">شاشة العرض المركزية</h1>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full px-4 py-3 bg-white/10 border border-gray-500 rounded-lg text-white" autoFocus />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">بدء العرض</button>
        </form>
      </div>
    </div>
  );

  const screenClinics = clinics.filter((c) => c.screen_id === clinics[selectedScreen - 1]?.screen_id);
  const currentDoctor = doctors[currentDoctorIndex % doctors.length];

  return (
    <div className={`min-h-screen bg-gray-900 text-white overflow-hidden relative flex flex-col font-cairo ${notification?.type === 'emergency' ? 'animate-pulse' : ''}`}>
      
      {/* === Notification Slider (Updated: Bigger, Single Line) === */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-500 ease-out ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`shadow-2xl border-b-8 border-white p-8 flex justify-center items-center h-40 ${
          notification?.type === 'emergency' ? 'bg-red-700' : 
          notification?.type === 'transfer' ? 'bg-indigo-700' :
          'bg-gradient-to-r from-amber-500 to-orange-600'
        }`}>
          <div className="flex items-center gap-8 w-full max-w-7xl justify-center">
            <div className="bg-white p-4 rounded-full animate-bounce shrink-0">
               {notification?.type === 'emergency' ? <AlertTriangle className="w-16 h-16 text-red-600" /> : 
                notification?.type === 'transfer' ? <ArrowRightLeft className="w-16 h-16 text-indigo-600" /> :
                <Bell className="w-16 h-16 text-orange-600" />}
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-white drop-shadow-lg whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
              {notification?.message}
            </h2>
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="h-20 bg-gradient-to-l from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shadow-md z-40">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{settings?.center_name}</h1>
          <div className="flex items-center gap-4 text-slate-300 text-lg font-mono">
            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400"/> {getArabicTime(currentTime)}</span>
            <span>|</span>
            <span>{getArabicDate(currentTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedScreen} onChange={(e) => setSelectedScreen(parseInt(e.target.value))} className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600">
            {[1, 2, 3, 4, 5].map((num) => <option key={num} value={num}>شاشة {toArabicNumbers(num)}</option>)}
          </select>
          <div className="flex bg-slate-700 rounded-lg p-1 gap-1">
             <button onClick={() => setIsZoomed(!isZoomed)} className={`p-2 rounded ${isZoomed ? 'bg-blue-600' : 'hover:bg-slate-600'}`}><ZoomIn className="w-5 h-5"/></button>
             <button onClick={handleFullscreen} className="p-2 hover:bg-slate-600 rounded"><Maximize className="w-5 h-5"/></button>
             <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-slate-600 rounded">{isMuted ? <VolumeX className="w-5 h-5 text-red-400"/> : <Volume2 className="w-5 h-5"/>}</button>
             <button onClick={() => { setIsAuthenticated(false); router.push('/'); }} className="p-2 hover:bg-red-900/50 text-red-400 rounded"><LogOut className="w-5 h-5"/></button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Clinics List */}
        <div className={`${isZoomed ? 'w-2/3' : 'w-1/3'} bg-slate-100/5 backdrop-blur-sm border-l border-slate-700 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar transition-all duration-300`}>
          {screenClinics.map((clinic) => (
            <div key={clinic.id} className={`
                relative overflow-hidden rounded-xl border transition-all duration-300 shadow-lg
                ${notification?.targetClinicId === clinic.id ? 'animate-flash z-10 scale-105' : ''} 
                ${clinic.is_active ? 'bg-white border-blue-100' : 'bg-slate-200 border-slate-300 opacity-60 grayscale'}
              `}>
              <div className={`absolute right-0 top-0 bottom-0 w-2 ${clinic.is_active ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
              <div className="p-5 pr-7">
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-bold ${isZoomed ? 'text-4xl' : 'text-2xl'} ${clinic.is_active ? 'text-slate-800' : 'text-slate-600'}`}>{clinic.clinic_name}</h3>
                  <span className={`font-black ${isZoomed ? 'text-8xl' : 'text-6xl'} ${clinic.is_active ? 'text-blue-600' : 'text-slate-500'}`}>{toArabicNumbers(clinic.current_number)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                     {clinic.is_active ? <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm font-bold"><Activity className="w-4 h-4" /> نشطة</span> : <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-sm font-bold"><Ban className="w-4 h-4" /> متوقفة</span>}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                     <Clock className="w-4 h-4" />
                     <span>{clinic.last_call_time ? new Date(clinic.last_call_time).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video & Doctor */}
        <div className={`${isZoomed ? 'w-1/3' : 'w-2/3'} flex flex-col bg-black transition-all duration-300`}>
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            <div className="text-center z-0 opacity-50">
               <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center mx-auto mb-4"><div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[30px] border-l-slate-600 border-b-[15px] border-b-transparent ml-2"></div></div>
               <p className="text-slate-500 text-xl">فيديو توعوي</p>
            </div>
          </div>
          
          {/* Doctor Card (Sliding Right to Left) */}
          <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 relative overflow-hidden">
             {doctors.length > 0 && currentDoctor ? (
               <div key={currentDoctor.id} className="h-full flex items-center p-6 animate-slide-in-right">
                 <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden shadow-2xl flex-shrink-0 bg-white flex items-center justify-center text-slate-400"><User className="w-16 h-16" /></div>
                 <div className="mr-6 flex-1">
                    <div className="flex items-center gap-3 mb-2"><span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">الطبيب المناوب</span></div>
                    <h2 className="text-2xl font-bold text-white mb-1">{currentDoctor.full_name}</h2>
                    <p className="text-lg text-blue-300 flex items-center gap-2"><Activity className="w-4 h-4"/>{currentDoctor.specialization}</p>
                 </div>
               </div>
             ) : <div className="h-full flex items-center justify-center text-slate-500"><p>جاري تحميل بيانات الأطباء...</p></div>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-14 bg-blue-900 border-t border-blue-700 flex items-center relative overflow-hidden shadow-lg z-50">
         <div className="bg-blue-800 h-full px-6 flex items-center z-10 shadow-lg"><span className="text-white font-bold whitespace-nowrap">شريط الأخبار</span></div>
         <div className="absolute whitespace-nowrap animate-slide-left text-white text-xl font-medium px-4 w-full" style={{ animationDuration: `${settings?.news_ticker_speed || 30}s` }}>{settings?.news_ticker_content}</div>
      </div>
      
      <style jsx global>{`
        /* Animation: Slide In Right (Right to Left) */
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Animation: Flash */
        @keyframes flash {
          0%, 100% { opacity: 1; transform: scale(1.02); border-color: #2563eb; box-shadow: 0 0 15px rgba(37, 99, 235, 0.5); }
          50% { opacity: 0.8; transform: scale(1.05); border-color: #facc15; box-shadow: 0 0 25px rgba(250, 204, 21, 0.8); background-color: #fefce8; }
        }
        .animate-flash {
          animation: flash 1s infinite;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

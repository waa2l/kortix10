'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings, useDoctors, useQueue } from '@/lib/hooks'; 
import { supabase } from '@/lib/supabase'; // للـ Realtime المخصص للطوارئ
import { Lock, LogOut, Maximize, Minimize, Volume2, VolumeX, Bell, Activity, Ban, Clock, User, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';
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
    subtext: string; 
    type: 'normal' | 'emergency';
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

  // --- Realtime Logic ---

  // 1. الاستماع للطوارئ من جدول queue
  useEffect(() => {
    if (!isAuthenticated) return;

    const queueChannel = supabase.channel('emergency-queue')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'queue', filter: 'is_emergency=eq.true' },
        (payload) => {
          // عند وصول حالة طوارئ جديدة
          const clinicName = clinics.find(c => c.id === payload.new.clinic_id)?.clinic_name || 'العيادة';
          triggerEmergency(clinicName);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(queueChannel); };
  }, [isAuthenticated, clinics]);

  const triggerEmergency = async (clinicName: string) => {
    setNotification({
      show: true,
      message: '⚠️ حالة طوارئ ⚠️',
      subtext: `يرجى إخلاء الطريق لـ ${clinicName}`,
      type: 'emergency'
    });

    if (!isMuted) {
      try {
        await playAudio('/audio/emergency.mp3');
      } catch (e) { console.error(e); }
    }

    // إخفاء التنبيه بعد 15 ثانية
    setTimeout(() => setNotification(null), 15000);
  };

  // 2. الاستماع للنداءات العادية
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
          // تشغيل التنبيه العادي فقط إذا لم يكن هناك طوارئ حالياً
          if (notification?.type !== 'emergency') {
            triggerAlert(clinic);
          }
      }
    });

    prevClinicsRef.current = clinics;
  }, [clinics, isAuthenticated, isMuted, clinicsLoading]);

  const triggerAlert = async (clinic: any) => {
    setNotification({
      show: true,
      message: `العميل رقم ${toArabicNumbers(clinic.current_number)}`,
      subtext: `يرجى التوجه إلى ${clinic.clinic_name}`,
      type: 'normal'
    });

    setTimeout(() => setNotification(null), 10000);

    if (!isMuted) {
      const audioFiles = [
        '/audio/ding.mp3',
        `/audio/${clinic.current_number}.mp3`,
        `/audio/clinic${clinic.clinic_number}.mp3`
      ];
      try {
        await playSequentialAudio(audioFiles);
      } catch (error) { console.error("Audio error:", error); }
    }
  };

  // Auth Handlers
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'screen123') { 
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedScreen(1);
    router.push('/');
  };

  if (!isClient || clinicsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="text-center text-white">
          <div className="spinner mb-4 border-white border-t-transparent"></div>
          <p className="font-bold">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full text-white">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">شاشة العرض المركزية</h1>
            <p className="text-gray-300 mt-2">نظام إدارة الطوابير الذكي</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور..."
              className="w-full px-4 py-3 bg-white/10 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105">
              بدء العرض
            </button>
          </form>
        </div>
      </div>
    );
  }

  const screenClinics = clinics.filter((c) => c.screen_id === clinics[selectedScreen - 1]?.screen_id);
  const currentDoctor = doctors[currentDoctorIndex % doctors.length];

  return (
    <div className={`min-h-screen bg-gray-900 text-white overflow-hidden relative flex flex-col font-cairo ${notification?.type === 'emergency' ? 'animate-pulse' : ''}`}>
      
      {/* === Notification Slider === */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-500 ease-out ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`shadow-2xl border-b-4 border-white p-6 flex justify-between items-center ${
          notification?.type === 'emergency' 
            ? 'bg-gradient-to-r from-red-600 to-red-800' 
            : 'bg-gradient-to-r from-amber-500 to-orange-600'
        }`}>
          <div className="flex items-center gap-6">
            <div className="bg-white p-3 rounded-full animate-bounce">
               {notification?.type === 'emergency' ? <AlertTriangle className="w-10 h-10 text-red-600" /> : <Bell className="w-10 h-10 text-orange-600" />}
            </div>
            <div>
              <h2 className="text-4xl font-black text-white drop-shadow-md mb-1">{notification?.message}</h2>
              <p className="text-2xl text-white/90 font-semibold">{notification?.subtext}</p>
            </div>
          </div>
        </div>
      </div>

      {/* === Top Bar === */}
      <div className="h-20 bg-gradient-to-l from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shadow-md z-40">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            {settings?.center_name || 'المركز الطبي'}
          </h1>
          <div className="h-8 w-[2px] bg-slate-600"></div>
          <div className="flex items-center gap-4 text-slate-300 text-lg font-mono">
            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400"/> {getArabicTime(currentTime)}</span>
            <span>|</span>
            <span>{getArabicDate(currentTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedScreen}
            onChange={(e) => setSelectedScreen(parseInt(e.target.value))}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>شاشة {toArabicNumbers(num)}</option>
            ))}
          </select>
          <div className="flex bg-slate-700 rounded-lg p-1 gap-1">
             <button 
               onClick={() => setIsZoomed(!isZoomed)} 
               className={`p-2 rounded transition-colors ${isZoomed ? 'bg-blue-600 text-white' : 'hover:bg-slate-600'}`}
               title={isZoomed ? "تصغير القائمة" : "تكبير القائمة"}
             >
               {isZoomed ? <ZoomOut className="w-5 h-5"/> : <ZoomIn className="w-5 h-5"/>}
             </button>

             <button onClick={handleFullscreen} className="p-2 hover:bg-slate-600 rounded transition-colors" title="ملء الشاشة">
               {isFullscreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}
             </button>
             <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-slate-600 rounded transition-colors" title="كتم الصوت">
               {isMuted ? <VolumeX className="w-5 h-5 text-red-400"/> : <Volume2 className="w-5 h-5"/>}
             </button>
             <button onClick={handleLogout} className="p-2 hover:bg-red-900/50 text-red-400 rounded transition-colors" title="خروج">
               <LogOut className="w-5 h-5"/>
             </button>
          </div>
        </div>
      </div>

      {/* === Main Layout === */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* --- Left Column: Clinics List --- */}
        <div className={`${isZoomed ? 'w-2/3' : 'w-1/3'} bg-slate-100/5 backdrop-blur-sm border-l border-slate-700 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out`}>
          {screenClinics.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
               <p>لا توجد عيادات معينة لهذه الشاشة</p>
            </div>
          ) : (
            screenClinics.map((clinic) => (
              <div
                key={clinic.id}
                className={`
                  relative overflow-hidden rounded-xl border transition-all duration-300 shadow-lg
                  ${clinic.is_active 
                    ? 'bg-white border-blue-100 transform hover:scale-[1.01]' 
                    : 'bg-slate-200 border-slate-300 opacity-60 grayscale'
                  }
                `}
              >
                <div className={`absolute right-0 top-0 bottom-0 w-2 ${clinic.is_active ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                <div className="p-5 pr-7">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-bold ${isZoomed ? 'text-4xl' : 'text-2xl'} ${clinic.is_active ? 'text-slate-800' : 'text-slate-600'} transition-all`}>
                      {clinic.clinic_name}
                    </h3>
                    <span className={`font-black ${isZoomed ? 'text-8xl' : 'text-6xl'} ${clinic.is_active ? 'text-blue-600' : 'text-slate-500'} transition-all`}>
                      {toArabicNumbers(clinic.current_number)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                       {clinic.is_active ? (
                         <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm font-bold">
                           <Activity className="w-4 h-4" /> نشطة
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-sm font-bold">
                           <Ban className="w-4 h-4" /> متوقفة
                         </span>
                       )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                       <Clock className="w-4 h-4" />
                       <span>
                         {clinic.last_call_time 
                           ? new Date(clinic.last_call_time).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) 
                           : '--:--'}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- Right Column: Video & Doctor --- */}
        <div className={`${isZoomed ? 'w-1/3' : 'w-2/3'} flex flex-col bg-black transition-all duration-300 ease-in-out`}>
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group">
            <div className="text-center z-0 opacity-50">
               <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center mx-auto mb-4">
                 <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[30px] border-l-slate-600 border-b-[15px] border-b-transparent ml-2"></div>
               </div>
               <p className="text-slate-500 text-xl">فيديو توعوي</p>
            </div>
          </div>

          <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 relative overflow-hidden">
             {doctors.length > 0 && currentDoctor ? (
               <div key={currentDoctor.id} className="h-full flex items-center p-6 animate-slide-in-bottom">
                 <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden shadow-2xl flex-shrink-0 bg-white">
                   <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                     <User className="w-16 h-16" />
                   </div>
                 </div>
                 <div className="mr-6 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">الطبيب المناوب</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{currentDoctor.full_name}</h2>
                    <p className="text-lg text-blue-300 flex items-center gap-2">
                      <Activity className="w-4 h-4"/>
                      {currentDoctor.specialization}
                    </p>
                 </div>
               </div>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-500">
                 <p>جاري تحميل بيانات الأطباء...</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* === Footer === */}
      <div className="h-14 bg-blue-900 border-t border-blue-700 flex items-center relative overflow-hidden shadow-lg z-50">
         <div className="bg-blue-800 h-full px-6 flex items-center z-10 shadow-lg">
            <span className="text-white font-bold whitespace-nowrap">شريط الأخبار</span>
         </div>
         <div className="absolute whitespace-nowrap animate-slide-left text-white text-xl font-medium px-4 w-full" style={{ animationDuration: `${settings?.news_ticker_speed || 30}s` }}>
            {settings?.news_ticker_content}
         </div>
      </div>
      
      <style jsx global>{`
        @keyframes slideInBottom {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-bottom {
          animation: slideInBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

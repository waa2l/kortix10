'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings, useDoctors } from '@/lib/hooks'; 
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, Maximize, Minimize, Volume2, VolumeX, Bell, Activity, Ban, Clock, User, ZoomIn, ZoomOut, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { toArabicNumbers, getArabicDate, getArabicTime, playSequentialAudio, playAudio } from '@/lib/utils'; 

// --- إعدادات الفيديو المحلي ---
const SERVER_IP = 'http://192.168.1.48:8080'; // تأكد أن هذا الآي بي ثابت ولم يتغير
const VIDEOS_COUNT = 28; // عدد الفيديوهات (من 1.mp4 إلى 28.mp4)

// توليد قائمة الفيديوهات تلقائياً (1.mp4, 2.mp4 ...)
const LOCAL_VIDEOS = Array.from({ length: VIDEOS_COUNT }, (_, i) => {
  // ملاحظة: إذا كنت قد اخترت مجلد videos داخل تطبيق السيرفر ليكون هو الجذر (Root)، فالرابط يكون مباشرة:
  return `${SERVER_IP}/${i + 1}.mp4`;
  
  // أما إذا كان السيرفر يقرأ الذاكرة كاملة، قد تحتاج لإضافة اسم المجلد هكذا:
  // return `${SERVER_IP}/videos/${i + 1}.mp4`;
});

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
  
  // Video State
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Notification State
  const [notification, setNotification] = useState<{ 
    show: boolean; 
    message: string; 
    type: 'normal' | 'emergency' | 'transfer';
    targetClinicId?: string;
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

  // دالة لتشغيل الفيديو التالي
  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % LOCAL_VIDEOS.length);
  };

  // معالجة خطأ الفيديو (لو ملف ناقص ينتقل للي بعده)
  const handleVideoError = () => {
    console.warn(`فشل تشغيل الفيديو: ${LOCAL_VIDEOS[currentVideoIndex]}، الانتقال للتالي...`);
    setCurrentVideoIndex((prev) => (prev + 1) % LOCAL_VIDEOS.length);
  };

  // --- Realtime Listeners ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const queueChannel = supabase.channel('display-queue')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'queue', filter: 'is_emergency=eq.true' },
        (payload) => {
          const clinicName = clinics.find(c => c.id === payload.new.clinic_id)?.clinic_name || 'العيادة';
          triggerEmergency(clinicName);
        }
      )
      .subscribe();

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
      
      {/* === Notification Slider === */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-500 ease-out ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`shadow-2xl border-b-8 border-white p-6 flex justify-center items-center h-32 ${
          notification?.type === 'emergency' ? 'bg-red-700' : 
          notification?.type === 'transfer' ? 'bg-indigo-700' :
          'bg-gradient-to-r from-amber-500 to-orange-600'
        }`}>
          <div className="flex items-center gap-6 w-full max-w-7xl justify-center">
            <div className="bg-white p-3 rounded-full animate-bounce shrink-0">
               {notification?.type === 'emergency' ? <AlertTriangle className="w-12 h-12 text-red-600" /> : 
                notification?.type === 'transfer' ? <ArrowRightLeft className="w-12 h-12 text-indigo-600" /> :
                <Bell className="w-12 h-12 text-orange-600" />}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
              {notification?.message}
            </h2>
          </div>
        </div>
      </div>

      {/* === Top Bar === */}
      <div className="h-24 bg-gradient-to-l from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between px-8 shadow-md z-40">
        <div className="flex items-center gap-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-md">
            {settings?.center_name || 'المركز الطبي'}
          </h1>
          <div className="h-10 w-[2px] bg-slate-600"></div>
          <div className="flex items-center gap-6 text-slate-200 text-2xl font-mono tracking-wide">
            <span className="flex items-center gap-3"><Clock className="w-7 h-7 text-blue-400"/> {getArabicTime(currentTime)}</span>
            <span className="text-slate-500">|</span>
            <span>{getArabicDate(currentTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select value={selectedScreen} onChange={(e) => setSelectedScreen(parseInt(e.target.value))} className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 font-bold">
            {[1, 2, 3, 4, 5].map((num) => <option key={num} value={num}>شاشة {toArabicNumbers(num)}</option>)}
          </select>
          <div className="flex bg-slate-700 rounded-lg p-1 gap-1">
             <button onClick={() => setIsZoomed(!isZoomed)} className={`p-3 rounded transition-colors ${isZoomed ? 'bg-blue-600 text-white' : 'hover:bg-slate-600'}`} title={isZoomed ? "تصغير القائمة" : "تكبير القائمة"}>
               {isZoomed ? <ZoomOut className="w-6 h-6"/> : <ZoomIn className="w-6 h-6"/>}
             </button>
             <button onClick={handleFullscreen} className="p-3 hover:bg-slate-600 rounded transition-colors"><Maximize className="w-6 h-6"/></button>
             <button onClick={() => setIsMuted(!isMuted)} className="p-3 hover:bg-slate-600 rounded transition-colors">{isMuted ? <VolumeX className="w-6 h-6 text-red-400"/> : <Volume2 className="w-6 h-6"/>}</button>
             <button onClick={() => { setIsAuthenticated(false); router.push('/'); }} className="p-3 hover:bg-red-900/50 text-red-400 rounded transition-colors"><LogOut className="w-6 h-6"/></button>
          </div>
        </div>
      </div>

      {/* === Main Layout === */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* --- Left Column: Clinics & Doctors --- */}
        <div className={`${isZoomed ? 'w-1/2' : 'w-1/3'} flex flex-col border-l border-slate-700 transition-all duration-500 ease-in-out`}>
          
          {/* A. Clinics List */}
          <div className="flex-1 bg-slate-100/5 backdrop-blur-sm p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {screenClinics.map((clinic) => (
              <div key={clinic.id} className={`
                  relative overflow-hidden rounded-xl border transition-all duration-300 shadow-lg
                  ${notification?.targetClinicId === clinic.id ? 'animate-flash z-10 scale-105' : ''} 
                  ${clinic.is_active ? 'bg-white border-blue-100' : 'bg-slate-200 border-slate-300 opacity-60 grayscale'}
                `}>
                <div className={`absolute right-0 top-0 bottom-0 w-3 ${clinic.is_active ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                <div className="p-5 pr-8">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-bold ${isZoomed ? 'text-4xl' : 'text-3xl'} ${clinic.is_active ? 'text-slate-800' : 'text-slate-600'}`}>{clinic.clinic_name}</h3>
                    <span className={`font-black ${isZoomed ? 'text-8xl' : 'text-7xl'} ${clinic.is_active ? 'text-blue-600' : 'text-slate-500'}`}>{toArabicNumbers(clinic.current_number)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                       {clinic.is_active ? <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm font-bold"><Activity className="w-4 h-4" /> نشطة</span> : <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-sm font-bold"><Ban className="w-4 h-4" /> متوقفة</span>}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 font-mono text-lg">
                       <Clock className="w-5 h-5" />
                       <span>{clinic.last_call_time ? new Date(clinic.last_call_time).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* B. Doctor Rotator */}
          <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 border-t-4 border-slate-700 relative overflow-hidden shrink-0">
             {doctors.length > 0 && currentDoctor ? (
               <div key={currentDoctor.id} className="h-full flex items-center p-6 animate-slide-in-right">
                 <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden shadow-2xl flex-shrink-0 bg-white flex items-center justify-center text-slate-400 relative z-10">
                    <User className="w-16 h-16" />
                 </div>
                 <div className="mr-6 flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-2"><span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-sm">الطبيب المناوب</span></div>
                    <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{currentDoctor.full_name}</h2>
                    <p className="text-xl text-blue-300 flex items-center gap-2"><Activity className="w-5 h-5"/>{currentDoctor.specialization}</p>
                 </div>
                 <User className="absolute -left-6 -bottom-6 w-48 h-48 text-white/5 rotate-12 z-0" />
               </div>
             ) : <div className="h-full flex items-center justify-center text-slate-500"><p>جاري تحميل بيانات الأطباء...</p></div>}
          </div>

        </div>

        {/* --- Right Column: Video Only (Local Storage) --- */}
        <div className={`${isZoomed ? 'w-1/2' : 'w-2/3'} bg-black transition-all duration-500 ease-in-out relative border-r border-slate-800 flex items-center justify-center`}>
           {LOCAL_VIDEOS.length > 0 ? (
             <video
               key={LOCAL_VIDEOS[currentVideoIndex]}
               ref={videoRef}
               className="w-full h-full object-contain"
               autoPlay
               muted={isMuted}
               controls 
               onEnded={handleVideoEnded}
               onError={handleVideoError} // إذا فشل فيديو ينتقل للي بعده
             >
               <source src={LOCAL_VIDEOS[currentVideoIndex]} type="video/mp4" />
               <p className="text-white text-center">
                  المتصفح لا يمكنه الوصول للسيرفر المحلي.<br/>
                  تأكد من إعدادات Kiwi Browser للسماح بـ Insecure Content.
               </p>
             </video>
           ) : (
             <div className="text-white text-xl">لا توجد فيديوهات للعرض</div>
           )}
           
           {/* معلومات التصحيح (تظهر فقط عند حدوث مشكلة) */}
           <div className="absolute bottom-2 left-2 bg-black/20 text-[10px] text-white/30 p-1 pointer-events-none">
             Server: {SERVER_IP} | File: {currentVideoIndex + 1}.mp4
           </div>
        </div>

      </div>

      {/* Footer */}
      <div className="h-16 bg-blue-900 border-t border-blue-700 flex items-center relative overflow-hidden shadow-lg z-50">
         <div className="bg-blue-800 h-full px-8 flex items-center z-10 shadow-2xl skew-x-12 -ml-6"><span className="text-white font-bold whitespace-nowrap text-xl -skew-x-12">شريط الأخبار</span></div>
         <div className="absolute whitespace-nowrap animate-slide-left text-white text-2xl font-medium px-4 w-full pt-1" style={{ animationDuration: `${settings?.news_ticker_speed || 30}s` }}>{settings?.news_ticker_content}</div>
      </div>
      
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes flash {
          0%, 100% { transform: scale(1); border-color: #2563eb; }
          50% { transform: scale(1.03); border-color: #facc15; box-shadow: 0 0 30px rgba(250, 204, 21, 0.6); background-color: #fffbeb; }
        }
        .animate-flash {
          animation: flash 1.5s infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings, useDoctors } from '@/lib/hooks'; 
import { supabase } from '@/lib/supabase';
import { 
  Lock, LogOut, Maximize, Minimize, Volume2, VolumeX, Bell, 
  Activity, Ban, Clock, User, ZoomIn, ZoomOut, AlertTriangle, 
  ArrowRightLeft, Users, Settings2, LayoutGrid, Type, Monitor, MoveHorizontal
} from 'lucide-react';
import { toArabicNumbers, getArabicDate, getArabicTime, playSequentialAudio, playAudio } from '@/lib/utils'; 

const PATH_PREFIX = '/videos'; 
const VIDEOS_COUNT = 28; 

const LOCAL_VIDEOS = Array.from({ length: VIDEOS_COUNT }, (_, i) => {
  return `${PATH_PREFIX}/${i + 1}.mp4`;
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
  
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [displayConfig, setDisplayConfig] = useState({
    aspectRatio: 'aspect-[3/2]', 
    gridCols: 2,                 
    textSize: 'normal',          
    gapSize: 'normal'            
  });

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null); 
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handleVideoEnded = () => {
    setVideoError(null);
    setCurrentVideoIndex((prev) => (prev + 1) % LOCAL_VIDEOS.length);
  };

  const handleVideoError = (e: any) => {
    const errorMsg = `Error: ${LOCAL_VIDEOS[currentVideoIndex]}`;
    console.warn(errorMsg, e);
    setVideoError(errorMsg);
    setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % LOCAL_VIDEOS.length);
    }, 2000);
  };

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(err => console.log("Auto-play prevented:", err));
    }
  }, [currentVideoIndex]);

  // --- Realtime Listeners ---
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const queueChannel = supabase.channel('display-queue')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'queue', filter: 'is_emergency=eq.true' }, (payload) => { 
          const clinicName = clinics.find(c => c.id === payload.new.clinic_id)?.clinic_name || 'العيادة'; 
          triggerEmergency(clinicName); 
      })
      .subscribe();

    const alertChannel = supabase.channel('control-alerts')
      .on('broadcast', { event: 'clinic-transfer' }, (payload) => { 
          triggerTransferAlert(payload.payload); 
      })
      .on('broadcast', { event: 'name-alert' }, (payload) => {
        setNotification({
          show: true,
          message: `نداء للعميل: ${payload.payload.name} - ${payload.payload.clinicName}`,
          type: 'normal'
        });
        if (!isMuted) playAudio('/audio/ding.mp3').catch(console.error);
        setTimeout(() => setNotification(null), 10000);
      })
      // +++ جديد: تشغيل الملفات الجاهزة +++
      .on('broadcast', { event: 'play-instant' }, (payload) => {
        if (!isMuted && payload.payload.file) {
          playAudio(`/audio/${payload.payload.file}`).catch(console.error);
        }
      })
      // +++ جديد: تشغيل الصوت المباشر (المسجل) +++
      .on('broadcast', { event: 'voice-broadcast' }, (payload) => {
        if (!isMuted && payload.payload.audioData) {
          // تشغيل تنبيه أولاً
          playAudio('/audio/ding.mp3').then(() => {
             // ثم تشغيل الصوت المسجل
             const audio = new Audio(payload.payload.audioData);
             audio.play().catch(console.error);
          }).catch(console.error);
          
          setNotification({ show: true, message: '🎙️ تنبيه صوتي من الإدارة', type: 'normal' });
          setTimeout(() => setNotification(null), 10000);
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(queueChannel); 
      supabase.removeChannel(alertChannel); 
    };
  }, [isAuthenticated, clinics, isMuted]);

  useEffect(() => {
    if (!isAuthenticated || clinicsLoading) return;
    if (isFirstLoad.current && clinics.length > 0) { prevClinicsRef.current = clinics; isFirstLoad.current = false; return; }
    
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
  const triggerEmergency = async (clinicName: string) => { setNotification({ show: true, message: `⚠️ طوارئ: يرجى إخلاء الطريق لـ ${clinicName} ⚠️`, type: 'emergency' }); if (!isMuted) await playAudio('/audio/emergency.mp3').catch(console.error); setTimeout(() => setNotification(null), 15000); };
  const triggerTransferAlert = async (data: any) => { setNotification({ show: true, message: `( تحويل ) العميل رقم ${toArabicNumbers(data.ticketNumber)} التوجه إلى ${data.toClinicName}`, type: 'transfer', targetClinicId: data.toClinicId }); if (!isMuted) { try { await playSequentialAudio(['/audio/ding.mp3', `/audio/${data.ticketNumber}.mp3`, `/audio/clinic${data.toClinicNumber}.mp3`]); } catch (e) { console.error(e); } } setTimeout(() => setNotification(null), 10000); };
  const triggerAlert = async (clinic: any) => { setNotification({ show: true, message: `العميل رقم ${toArabicNumbers(clinic.current_number)} التوجه إلى ${clinic.clinic_name}`, type: 'normal', targetClinicId: clinic.id }); if (!isMuted) { try { await playSequentialAudio(['/audio/ding.mp3', `/audio/${clinic.current_number}.mp3`, `/audio/clinic${clinic.clinic_number}.mp3`]); } catch (e) { console.error(e); } } setTimeout(() => setNotification(null), 10000); };

  const handlePasswordSubmit = (e: React.FormEvent) => { e.preventDefault(); if (password === 'screen123') { setIsAuthenticated(true); setPassword(''); } else { alert('كلمة المرور غير صحيحة'); } };
  const handleFullscreen = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); } else { document.exitFullscreen(); setIsFullscreen(false); } };

  // --- Helpers for Display Settings ---
  const getGridClass = () => {
    if (displayConfig.gridCols === 1) return 'grid-cols-1';
    if (displayConfig.gridCols === 2) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  const getGapClass = () => {
    switch(displayConfig.gapSize) {
      case 'small': return 'gap-2';
      case 'large': return 'gap-6';
      default: return 'gap-4';
    }
  };

  const getTextSizes = () => {
    switch(displayConfig.textSize) {
      case 'xs': return { name: 'text-lg', number: 'text-5xl', meta: 'text-sm' };
      case 'small': return { name: 'text-xl', number: 'text-6xl', meta: 'text-base' };
      case 'large': return { name: 'text-4xl', number: 'text-9xl', meta: 'text-xl' };
      case 'xl': return { name: 'text-5xl', number: 'text-[10rem]', meta: 'text-2xl' }; 
      default: return { name: 'text-3xl', number: 'text-8xl', meta: 'text-lg' }; 
    }
  };
  const textSizes = getTextSizes();

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
      
      {/* Notification Slider */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-500 ease-out ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`shadow-2xl border-b-8 border-white p-4 flex justify-center items-center h-28 ${notification?.type === 'emergency' ? 'bg-red-700' : notification?.type === 'transfer' ? 'bg-indigo-700' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}>
          <div className="flex items-center gap-4 w-full max-w-7xl justify-center">
            <div className="bg-white p-2 rounded-full animate-bounce shrink-0">
               {notification?.type === 'emergency' ? <AlertTriangle className="w-8 h-8 text-red-600" /> : notification?.type === 'transfer' ? <ArrowRightLeft className="w-8 h-8 text-indigo-600" /> : <Bell className="w-8 h-8 text-orange-600" />}
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-lg whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
              {notification?.message}
            </h2>
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="h-24 bg-gradient-to-l from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between px-8 shadow-md z-40 relative">
        <div className="flex items-center gap-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-md">{settings?.center_name || 'المركز الطبي'}</h1>
          <div className="h-10 w-[2px] bg-slate-600"></div>
          <div className="flex items-center gap-6 text-slate-200 text-2xl font-mono tracking-wide">
            <span className="flex items-center gap-3"><Clock className="w-7 h-7 text-blue-400"/> {getArabicTime(currentTime)}</span>
            <span className="text-slate-500">|</span>
            <span>{getArabicDate(currentTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          
          <div className="flex bg-slate-700 rounded-lg p-1 gap-1 relative">
             <button onClick={() => setShowDisplaySettings(!showDisplaySettings)} className={`p-3 rounded transition-colors ${showDisplaySettings ? 'bg-blue-600 text-white' : 'hover:bg-slate-600 text-slate-300'}`} title="إعدادات التنسيق"> <Settings2 className="w-6 h-6"/> </button>
             <div className="w-[1px] bg-slate-600 mx-1"></div>
             <select value={selectedScreen} onChange={(e) => setSelectedScreen(parseInt(e.target.value))} className="px-4 py-2 bg-slate-800 text-white rounded-md border-none outline-none font-bold cursor-pointer hover:bg-slate-600 transition-colors">
               {[1, 2, 3, 4, 5].map((num) => <option key={num} value={num}>شاشة {toArabicNumbers(num)}</option>)}
             </select>
             <button onClick={() => setIsZoomed(!isZoomed)} className={`p-3 rounded transition-colors ${isZoomed ? 'bg-blue-600 text-white' : 'hover:bg-slate-600'}`}>{isZoomed ? <ZoomOut className="w-6 h-6"/> : <ZoomIn className="w-6 h-6"/>}</button>
             <button onClick={handleFullscreen} className="p-3 hover:bg-slate-600 rounded transition-colors"><Maximize className="w-6 h-6"/></button>
             <button onClick={() => setIsMuted(!isMuted)} className="p-3 hover:bg-slate-600 rounded transition-colors">{isMuted ? <VolumeX className="w-6 h-6 text-red-400"/> : <Volume2 className="w-6 h-6"/>}</button>
             <button onClick={() => { setIsAuthenticated(false); router.push('/'); }} className="p-3 hover:bg-red-900/50 text-red-400 rounded transition-colors"><LogOut className="w-6 h-6"/></button>
          </div>
        </div>

        {showDisplaySettings && (
          <div className="absolute top-24 left-8 bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-xl p-6 shadow-2xl z-50 w-96 animate-in fade-in slide-in-from-top-4">
             <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-600 pb-2"> <Settings2 className="w-5 h-5 text-blue-400"/> تخصيص العرض </h3>
             <div className="mb-4 grid grid-cols-2 gap-4">
               <div>
                  <label className="text-slate-400 text-xs mb-2 block flex items-center gap-2"><LayoutGrid className="w-3 h-3"/> الأعمدة</label>
                  <div className="flex gap-1"> {[1, 2, 3].map(cols => ( <button key={cols} onClick={() => setDisplayConfig({...displayConfig, gridCols: cols})} className={`flex-1 py-1 text-sm rounded border ${displayConfig.gridCols === cols ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>{cols}</button> ))} </div>
               </div>
               <div>
                  <label className="text-slate-400 text-xs mb-2 block flex items-center gap-2"><MoveHorizontal className="w-3 h-3"/> المسافات</label>
                  <div className="flex gap-1"> {['small', 'normal', 'large'].map(gap => ( <button key={gap} onClick={() => setDisplayConfig({...displayConfig, gapSize: gap})} className={`flex-1 py-1 text-xs rounded border ${displayConfig.gapSize === gap ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>{gap === 'small' ? 'S' : gap === 'normal' ? 'M' : 'L'}</button> ))} </div>
               </div>
             </div>
             <div className="mb-4">
               <label className="text-slate-400 text-xs mb-2 block flex items-center gap-2"><Monitor className="w-3 h-3"/> أبعاد الكروت</label>
               <div className="grid grid-cols-4 gap-1">
                 <button onClick={() => setDisplayConfig({...displayConfig, aspectRatio: 'aspect-square'})} className={`text-[10px] py-2 rounded border ${displayConfig.aspectRatio === 'aspect-square' ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>مربع 1:1</button>
                 <button onClick={() => setDisplayConfig({...displayConfig, aspectRatio: 'aspect-[3/2]'})} className={`text-[10px] py-2 rounded border ${displayConfig.aspectRatio === 'aspect-[3/2]' ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>مستطيل 3:2</button>
                 <button onClick={() => setDisplayConfig({...displayConfig, aspectRatio: 'aspect-[2/3]'})} className={`text-[10px] py-2 rounded border ${displayConfig.aspectRatio === 'aspect-[2/3]' ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>طولي 2:3</button>
                 <button onClick={() => setDisplayConfig({...displayConfig, aspectRatio: 'aspect-video'})} className={`text-[10px] py-2 rounded border ${displayConfig.aspectRatio === 'aspect-video' ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>عريض 16:9</button>
               </div>
             </div>
             <div>
               <label className="text-slate-400 text-xs mb-2 block flex items-center gap-2"><Type className="w-3 h-3"/> حجم الخطوط</label>
               <div className="grid grid-cols-5 gap-1">
                 {['xs', 'small', 'normal', 'large', 'xl'].map(size => ( <button key={size} onClick={() => setDisplayConfig({...displayConfig, textSize: size})} className={`text-[10px] py-2 rounded border ${displayConfig.textSize === size ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>{size.toUpperCase()}</button> ))}
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* --- Left Column --- */}
        <div className={`${isZoomed ? 'w-1/2' : 'w-1/3'} flex flex-col border-l border-slate-700 transition-all duration-500 ease-in-out`}>
          <div className="flex-1 bg-slate-100/5 backdrop-blur-sm p-4 overflow-y-auto custom-scrollbar">
            <div className={`grid ${getGridClass()} ${getGapClass()}`}>
              {screenClinics.map((clinic) => (
                <div key={clinic.id} className={`relative overflow-hidden rounded-xl border transition-all duration-300 shadow-lg ${displayConfig.aspectRatio} flex flex-col justify-between ${notification?.targetClinicId === clinic.id ? 'animate-flash z-10 scale-105' : ''} ${clinic.is_active ? 'bg-white border-blue-100' : 'bg-slate-200 border-slate-300 opacity-60 grayscale'}`}>
                  <div className={`absolute right-0 top-0 bottom-0 w-3 ${clinic.is_active ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="mb-2"><h3 className={`font-bold leading-tight ${textSizes.name} ${clinic.is_active ? 'text-slate-800' : 'text-slate-600'}`}>{clinic.clinic_name}</h3></div>
                    <div className="flex justify-center items-center flex-1"><span className={`font-black tracking-tighter ${textSizes.number} ${clinic.is_active ? 'text-blue-600' : 'text-slate-500'}`}>{toArabicNumbers(clinic.current_number)}</span></div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
                      <div className="flex items-center">{clinic.is_active ? <span className={`text-green-700 bg-green-100 px-2 py-1 rounded font-bold flex items-center gap-1 ${textSizes.meta}`}><Activity className="w-4 h-4"/> نشطة</span> : <span className={`text-slate-600 bg-slate-300 px-2 py-1 rounded font-bold flex items-center gap-1 ${textSizes.meta}`}><Ban className="w-4 h-4"/> متوقفة</span>}</div>
                      <div className={`flex items-center gap-1 text-slate-500 font-mono font-bold ${textSizes.meta}`}><Clock className="w-5 h-5" /><span>{clinic.last_call_time ? new Date(clinic.last_call_time).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-56 bg-gradient-to-r from-slate-900 to-slate-800 border-t-4 border-slate-700 relative overflow-hidden shrink-0 flex flex-col">
             <div className="absolute top-0 right-0 z-20"><div className="bg-blue-600 text-white px-6 py-1 rounded-bl-xl shadow-lg font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-blue-200" />فريق مقدمي الخدمة</div></div>
             {doctors.length > 0 && currentDoctor ? (
               <div key={currentDoctor.id} className="h-full flex items-center p-6 pt-8 animate-slide-in-right">
                 <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden shadow-2xl flex-shrink-0 bg-white flex items-center justify-center text-slate-400 relative z-10">{(currentDoctor as any).image_url ? (<img src={(currentDoctor as any).image_url} alt={currentDoctor.full_name} className="w-full h-full object-cover" />) : (<User className="w-16 h-16" />)}</div>
                 <div className="mr-6 flex-1 relative z-10 mt-4"><h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{currentDoctor.full_name}</h2><p className="text-xl text-blue-300 flex items-center gap-2"><Activity className="w-5 h-5"/>{currentDoctor.specialization}</p></div>
                 <User className="absolute -left-6 -bottom-6 w-48 h-48 text-white/5 rotate-12 z-0" />
               </div>
             ) : <div className="h-full flex items-center justify-center text-slate-500"><p>جاري تحميل بيانات الأطباء...</p></div>}
          </div>
        </div>

        {/* --- Right Column: Video --- */}
        <div className={`${isZoomed ? 'w-1/2' : 'w-2/3'} bg-black transition-all duration-500 ease-in-out relative border-r border-slate-800 flex items-center justify-center`}>
           {LOCAL_VIDEOS.length > 0 ? (
             <>
               <video ref={videoRef} className="w-full h-full object-contain" muted={isMuted} controls playsInline src={LOCAL_VIDEOS[currentVideoIndex]} onEnded={handleVideoEnded} onError={handleVideoError} />
               {videoError && (<div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"><div className="bg-red-900/80 p-6 rounded-xl border border-red-500 text-white text-center max-w-lg"><h3 className="text-xl font-bold mb-2">تنبيه فيديو</h3><p className="text-sm mb-4">تعذر تشغيل الفيديو...</p></div></div>)}
             </>
           ) : <div className="text-white text-xl">لا توجد فيديوهات للعرض</div>}
        </div>
      </div>

      {/* Footer */}
       <div className="h-16 bg-blue-900 border-t border-blue-700 flex items-center relative overflow-hidden shadow-lg z-50">
         <div className="bg-blue-800 h-full px-8 flex items-center z-10 shadow-2xl skew-x-12 -ml-6"><span className="text-white font-bold whitespace-nowrap text-xl -skew-x-12">شريط الأخبار</span></div>
         <div className="absolute whitespace-nowrap animate-slide-left text-white text-2xl font-medium px-4 w-full pt-1" style={{ animationDuration: `${settings?.news_ticker_speed || 30}s` }}>{settings?.news_ticker_content}</div>
      </div>
      
      <style jsx global>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes flash { 0%, 100% { transform: scale(1); border-color: #2563eb; } 50% { transform: scale(1.03); border-color: #facc15; box-shadow: 0 0 30px rgba(250, 204, 21, 0.6); background-color: #fffbeb; } }
        .animate-flash { animation: flash 1.5s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings, useDoctors } from '@/lib/hooks'; 
import { supabase } from '@/lib/supabase';
import { 
  LogOut, Maximize, Volume2, VolumeX, Bell, 
  Activity, Monitor, Settings2, User, 
  Columns, LayoutTemplate, Square
} from 'lucide-react';
import { toArabicNumbers, playSequentialAudio, playAudio } from '@/lib/utils'; 

// --- ثوابت الفيديو ---
const PATH_PREFIX = '/videos'; 
const VIDEOS_COUNT = 28; 
const LOCAL_VIDEOS = Array.from({ length: VIDEOS_COUNT }, (_, i) => `${PATH_PREFIX}/${i + 1}.mp4`);

export default function DisplayScreen() {
  const router = useRouter();
  
  // --- البيانات ---
  const { clinics, loading: clinicsLoading } = useClinics();
  const { doctors } = useDoctors(); 
  const { settings } = useSettings();

  // --- الحالة العامة ---
  const [isClient, setIsClient] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(1);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // --- إعدادات العرض (التحكم الكامل) ---
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  
  const [displayConfig, setDisplayConfig] = useState({
    gridCols: 1,                 // الافتراضي عمود واحد لأن المساحة ضيقة (الربع)
    textSize: 'normal',          // حجم الخط
    aspectRatio: 'aspect-video', // نسبة أبعاد الكارت
    gapSize: 'small',            // مسافات صغيرة افتراضياً
    paddingSize: 'small',        // حواف صغيرة افتراضياً
    showDoctor: true,            // إظهار قسم الطبيب
    showVideo: true,             // إظهار الفيديو
    layoutRatio: '1/4',          // <--- الإعداد الجديد: نسبة تقسيم الشاشة
  });

  // --- حالة الفيديو ---
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- التنبيهات ---
  const [notification, setNotification] = useState<{ 
    show: boolean; 
    message: string; 
    type: 'normal' | 'emergency' | 'transfer';
    targetClinicId?: string;
  } | null>(null);
  
  const prevClinicsRef = useRef<typeof clinics>([]);
  const isFirstLoad = useRef(true);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);

  // --- تهيئة ---
  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (doctors.length > 0) { const t = setInterval(() => setCurrentDoctorIndex(p => (p + 1) % doctors.length), 15000); return () => clearInterval(t); } }, [doctors]);

  // --- دوال مساعدة للتنسيق ---
  const getFormattedDateTime = (date: Date) => {
    const dateStr = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    const timeStr = new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
    const fullTime = timeStr.replace('ص', 'صباحاً').replace('م', 'مساءً').replace('AM', 'صباحاً').replace('PM', 'مساءً');
    return `${dateStr} الساعة ${fullTime}`;
  };

  const getLayoutClasses = () => {
    if (!displayConfig.showVideo) return { cardWidth: 'w-full', videoWidth: 'hidden' };
    
    switch(displayConfig.layoutRatio) {
      case '1/4': return { cardWidth: 'w-[25%]', videoWidth: 'w-[75%]' }; // الوضع الافتراضي
      case '1/3': return { cardWidth: 'w-[33.33%]', videoWidth: 'w-[66.66%]' };
      case '1/2': return { cardWidth: 'w-[50%]', videoWidth: 'w-[50%]' };
      case '2/3': return { cardWidth: 'w-[66.66%]', videoWidth: 'w-[33.33%]' };
      default: return { cardWidth: 'w-[25%]', videoWidth: 'w-[75%]' };
    }
  };

  const getGridClass = () => {
    switch(displayConfig.gridCols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-1';
    }
  };

  const getGapClass = () => {
    switch(displayConfig.gapSize) {
      case 'none': return 'gap-0';
      case 'small': return 'gap-2';
      case 'normal': return 'gap-4';
      case 'large': return 'gap-8';
      default: return 'gap-4';
    }
  };

  const getPaddingClass = () => {
    switch(displayConfig.paddingSize) {
      case 'none': return 'p-0';
      case 'small': return 'p-2';
      case 'normal': return 'p-4';
      case 'large': return 'p-8';
      default: return 'p-4';
    }
  };

  const getTextClasses = () => {
    // أحجام ديناميكية تعتمد على حجم العمود
    switch(displayConfig.textSize) {
      case 'xs': return { title: 'text-base', number: 'text-3xl', meta: 'text-[10px]' };
      case 'small': return { title: 'text-lg', number: 'text-5xl', meta: 'text-xs' };
      case 'normal': return { title: 'text-2xl', number: 'text-7xl', meta: 'text-sm' };
      case 'large': return { title: 'text-3xl', number: 'text-8xl', meta: 'text-base' };
      case 'xl': return { title: 'text-4xl', number: 'text-[8rem]', meta: 'text-lg' };
      default: return { title: 'text-2xl', number: 'text-7xl', meta: 'text-sm' };
    }
  };
  const textStyles = getTextClasses();
  const layoutStyles = getLayoutClasses();

  // --- تشغيل الفيديو ---
  const handleVideoEnded = () => setCurrentVideoIndex(prev => (prev + 1) % LOCAL_VIDEOS.length);
  useEffect(() => { if (videoRef.current) { videoRef.current.load(); videoRef.current.play().catch(console.error); } }, [currentVideoIndex]);

  // --- Realtime ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const channel = supabase.channel('display_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'queue', filter: 'is_emergency=eq.true' }, payload => {
          const cName = clinics.find(c => c.id === payload.new.clinic_id)?.clinic_name || 'العيادة';
          setNotification({ show: true, message: `⚠️ طوارئ: ${cName}`, type: 'emergency' });
          if(!isMuted) playAudio('/audio/emergency.mp3').catch(console.error);
          setTimeout(() => setNotification(null), 15000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, clinics, isMuted]);

  useEffect(() => {
    if (!isAuthenticated || clinicsLoading) return;
    if (isFirstLoad.current && clinics.length > 0) { prevClinicsRef.current = clinics; isFirstLoad.current = false; return; }
    
    clinics.forEach((clinic) => {
      const prev = prevClinicsRef.current.find((c) => c.id === clinic.id);
      if (prev && clinic.last_call_time !== prev.last_call_time && clinic.last_call_time) {
         setNotification({ show: true, message: `العميل رقم ${toArabicNumbers(clinic.current_number)} -> ${clinic.clinic_name}`, type: 'normal', targetClinicId: clinic.id });
         if (!isMuted) playSequentialAudio(['/audio/ding.mp3', `/audio/${clinic.current_number}.mp3`, `/audio/clinic${clinic.clinic_number}.mp3`]).catch(console.error);
         setTimeout(() => setNotification(null), 10000);
      }
    });
    prevClinicsRef.current = clinics;
  }, [clinics, isAuthenticated, isMuted, clinicsLoading]);

  // --- شاشة تسجيل الدخول ---
  if (!isClient) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">جاري التحميل...</div>;
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-cairo">
      <div className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-2xl w-full max-w-md text-center">
        <Monitor className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-6">شاشة العرض</h1>
        <form onSubmit={(e) => { e.preventDefault(); if(password === 'screen123') setIsAuthenticated(true); else alert('خطأ'); }} className="space-y-4">
           <select className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700" value={selectedScreen} onChange={e=>setSelectedScreen(Number(e.target.value))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>شاشة {n}</option>)}</select>
           <input type="password" placeholder="كلمة المرور" className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700" value={password} onChange={e=>setPassword(e.target.value)} autoFocus/>
           <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition">دخول</button>
        </form>
      </div>
    </div>
  );

  const screenClinics = clinics.filter(c => c.screen_id === clinics[selectedScreen - 1]?.screen_id);
  const currentDoctor = doctors[currentDoctorIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col font-cairo relative">
      
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 h-20 flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-1.5 rounded shadow-lg shadow-blue-500/20"><Activity className="w-6 h-6 text-white" /></div>
           <h1 className="text-2xl font-bold text-white">{settings?.center_name || 'المركز الطبي'}</h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-xl font-bold text-blue-300 font-mono tracking-wide mt-1">{getFormattedDateTime(currentTime)}</div>
           <div className="h-8 w-px bg-slate-600 mx-2"></div>
           <div className="flex gap-2">
              <button onClick={() => setShowDisplaySettings(!showDisplaySettings)} className={`p-2 rounded transition ${showDisplaySettings ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}><Settings2/></button>
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-slate-700 text-slate-400 hover:text-white rounded">{isMuted ? <VolumeX/> : <Volume2/>}</button>
              <button onClick={() => { if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }} className="p-2 bg-slate-700 text-slate-400 hover:text-white rounded"><Maximize/></button>
              <button onClick={() => { setIsAuthenticated(false); setPassword(''); }} className="p-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded"><LogOut/></button>
           </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showDisplaySettings && (
        <div className="absolute top-24 left-6 w-80 bg-slate-800/95 backdrop-blur border border-slate-600 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
             <h3 className="font-bold flex items-center gap-2"><Settings2 className="w-4 h-4 text-blue-400"/> إعدادات العرض</h3>
             <button onClick={() => setShowDisplaySettings(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            
            {/* 1. تقسيم الشاشة */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><Columns className="w-3 h-3"/> مساحة الكروت</label>
              <div className="grid grid-cols-4 gap-1">
                {['1/4', '1/3', '1/2', '2/3'].map(r => (
                  <button key={r} onClick={() => setDisplayConfig({...displayConfig, layoutRatio: r})} className={`py-1 text-xs rounded border ${displayConfig.layoutRatio === r ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>{r === '1/4' ? 'ربع' : r === '1/3' ? 'ثلث' : r === '1/2' ? 'نصف' : 'ثلثين'}</button>
                ))}
              </div>
            </div>

            {/* 2. الأعمدة */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><LayoutTemplate className="w-3 h-3"/> عدد الأعمدة</label>
              <div className="flex gap-1">
                {[1,2,3,4].map(n => (
                  <button key={n} onClick={() => setDisplayConfig({...displayConfig, gridCols: n})} className={`flex-1 py-1 text-xs rounded border ${displayConfig.gridCols === n ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>{n}</button>
                ))}
              </div>
            </div>

            {/* 3. حجم الخط */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><Type className="w-3 h-3"/> حجم الخط</label>
              <div className="grid grid-cols-5 gap-1">
                {['xs','small','normal','large','xl'].map(s => (
                  <button key={s} onClick={() => setDisplayConfig({...displayConfig, textSize: s})} className={`py-1 text-[10px] rounded border ${displayConfig.textSize === s ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>{s}</button>
                ))}
              </div>
            </div>

            {/* 4. الأبعاد */}
            <div>
               <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><Square className="w-3 h-3"/> نسبة أبعاد الكارت</label>
               <select className="w-full bg-slate-700 border border-slate-600 rounded p-1 text-xs" value={displayConfig.aspectRatio} onChange={(e) => setDisplayConfig({...displayConfig, aspectRatio: e.target.value})}>
                 <option value="aspect-auto">تلقائي</option>
                 <option value="aspect-video">عريض (16:9)</option>
                 <option value="aspect-square">مربع (1:1)</option>
                 <option value="aspect-[4/3]">تقليدي (4:3)</option>
               </select>
            </div>

            {/* خيارات إضافية */}
            <div className="pt-2 border-t border-slate-600 space-y-2">
               <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-700 p-1 rounded"><span>عرض الفيديو</span><input type="checkbox" checked={displayConfig.showVideo} onChange={(e) => setDisplayConfig({...displayConfig, showVideo: e.target.checked})} className="accent-blue-600"/></label>
               <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-700 p-1 rounded"><span>عرض الطبيب</span><input type="checkbox" checked={displayConfig.showDoctor} onChange={(e) => setDisplayConfig({...displayConfig, showDoctor: e.target.checked})} className="accent-blue-600"/></label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Clinics */}
        <div className={`transition-all duration-500 flex flex-col ${layoutStyles.cardWidth} ${displayConfig.showVideo ? 'border-l border-slate-700' : ''}`}>
           <div className={`flex-1 overflow-y-auto ${getPaddingClass()}`}>
              <div className={`grid ${getGridClass()} ${getGapClass()}`}>
                 {screenClinics.map(clinic => (
                   <div key={clinic.id} className={`relative bg-white text-slate-900 rounded-xl overflow-hidden shadow-xl flex flex-col ${displayConfig.aspectRatio} ${clinic.is_active ? '' : 'opacity-60 grayscale'} ${notification?.targetClinicId === clinic.id ? 'ring-8 ring-yellow-400 animate-pulse' : ''}`}>
                      <div className={`absolute top-0 right-0 bottom-0 w-2 ${clinic.is_active ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                      <div className="flex-1 flex flex-col items-center justify-center p-2 text-center">
                         <h2 className={`font-bold mb-1 ${textStyles.title} text-slate-800 line-clamp-2 leading-tight`}>{clinic.clinic_name}</h2>
                         <div className={`font-black text-blue-600 leading-none ${textStyles.number}`}>{toArabicNumbers(clinic.current_number)}</div>
                      </div>
                      <div className="bg-slate-100 p-2 flex justify-between items-center border-t border-slate-200">
                         <div className={`font-bold ${textStyles.meta} ${clinic.is_active ? 'text-green-600' : 'text-slate-500'}`}>{clinic.is_active ? '● متاح' : '● مغلق'}</div>
                         <div className={`font-mono text-slate-500 dir-ltr ${textStyles.meta}`}>{clinic.last_call_time ? new Date(clinic.last_call_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'}) : '--:--'}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Footer: Doctor Info */}
           {displayConfig.showDoctor && currentDoctor && (
             <div className="bg-slate-800 border-t border-slate-700 flex items-center px-4 py-3 shrink-0 relative overflow-hidden">
                <div className="absolute right-0 top-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-bl z-10 font-bold">الطبيب</div>
                <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden bg-white relative z-10 shrink-0 flex items-center justify-center">
                   {(currentDoctor as any).image_url ? (
                      <img src={(currentDoctor as any).image_url} className="w-full h-full object-cover" />
                   ) : (
                      <User className="w-8 h-8 text-slate-300"/>
                   )}
                </div>
                <div className="mr-3 z-10 overflow-hidden">
                   <h3 className="text-lg font-bold text-white truncate">{currentDoctor.full_name}</h3>
                   <p className="text-sm text-blue-300 truncate">{currentDoctor.specialization}</p>
                </div>
             </div>
           )}
        </div>

        {/* Right: Video */}
        {displayConfig.showVideo && (
          <div className={`${layoutStyles.videoWidth} bg-black relative flex items-center justify-center transition-all duration-500`}>
             <video ref={videoRef} className="w-full h-full object-contain" src={LOCAL_VIDEOS[currentVideoIndex]} muted={isMuted} onEnded={handleVideoEnded} autoPlay playsInline />
          </div>
        )}
      </div>

      {/* Bottom Ticker */}
      <div className="h-10 bg-blue-900 flex items-center shrink-0 border-t border-blue-700 relative z-30">
         <div className="bg-blue-800 h-full px-4 flex items-center font-bold text-base z-20 shadow-xl whitespace-nowrap">أخبار المركز</div>
         <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="whitespace-nowrap animate-marquee text-lg px-4 absolute w-full font-medium" style={{ animationDuration: `${settings?.news_ticker_speed || 30}s` }}>
               {settings?.news_ticker_content || 'مرحباً بكم في المركز الطبي... نتمنى لكم الشفاء العاجل'}
            </div>
         </div>
      </div>

      <style jsx global>{`
         @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
         .animate-marquee { animation: marquee linear infinite; }
         .custom-scrollbar::-webkit-scrollbar { width: 5px; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
      `}</style>

      {/* Notifications */}
      {notification && (
        <div className={`fixed top-24 inset-x-0 z-50 p-4 transition-transform duration-500 ${notification.show ? 'translate-y-0' : '-translate-y-full'}`}>
           <div className={`mx-auto max-w-4xl shadow-2xl rounded-2xl p-6 border-4 flex items-center justify-center gap-6 ${notification.type === 'emergency' ? 'bg-red-600 border-red-800' : 'bg-amber-500 border-amber-700'}`}>
              <Bell className="w-16 h-16 text-white animate-bounce" />
              <h2 className="text-4xl font-black text-white drop-shadow-lg">{notification.message}</h2>
           </div>
        </div>
      )}
    </div>
  );
}

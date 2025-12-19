'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings, useDoctors } from '@/lib/hooks'; 
import { supabase } from '@/lib/supabase';
import { 
  Lock, LogOut, Maximize, Volume2, VolumeX, Bell, 
  Activity, Ban, Clock, User, ZoomIn, ZoomOut, AlertTriangle, 
  ArrowRightLeft, Settings2, LayoutGrid, Type, Monitor, MoveHorizontal,
  Expand, Shrink
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
    gridCols: 3,             // عدد الأعمدة الافتراضي
    textSize: 'normal',      // حجم الخط
    aspectRatio: 'aspect-video', // نسبة أبعاد الكارت
    gapSize: 'normal',       // المسافات بين الكروت
    paddingSize: 'normal',   // الحواف الداخلية للشاشة
    showDoctor: true,        // إظهار/إخفاء قسم الطبيب
    showVideo: true,         // إظهار/إخفاء الفيديو
    splitRatio: 30,          // نسبة تقسيم الشاشة (للفيديو)
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

  // ساعة وتاريخ
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // تدوير الأطباء
  useEffect(() => {
    if (doctors.length > 0) {
      const timer = setInterval(() => setCurrentDoctorIndex(p => (p + 1) % doctors.length), 15000);
      return () => clearInterval(timer);
    }
  }, [doctors]);

  // --- دوال مساعدة للتنسيق ---
  const getFormattedDateTime = (date: Date) => {
    const dateStr = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    const timeStr = new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
    // تحويل "ص" إلى "صباحاً" و "م" إلى "مساءً" يدوياً إذا لزم الأمر، أو الاعتماد على المتصفح
    const fullTime = timeStr.replace('ص', 'صباحاً').replace('م', 'مساءً').replace('AM', 'صباحاً').replace('PM', 'مساءً');
    return `${dateStr} الساعة ${fullTime}`;
  };

  const getGridClass = () => {
    switch(displayConfig.gridCols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-3';
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
    switch(displayConfig.textSize) {
      case 'xs': return { title: 'text-lg', number: 'text-4xl', meta: 'text-xs' };
      case 'small': return { title: 'text-xl', number: 'text-6xl', meta: 'text-sm' };
      case 'normal': return { title: 'text-3xl', number: 'text-8xl', meta: 'text-lg' };
      case 'large': return { title: 'text-4xl', number: 'text-9xl', meta: 'text-xl' };
      case 'xl': return { title: 'text-5xl', number: 'text-[10rem]', meta: 'text-2xl' };
      default: return { title: 'text-3xl', number: 'text-8xl', meta: 'text-lg' };
    }
  };
  const textStyles = getTextClasses();

  // --- تشغيل الفيديو ---
  const handleVideoEnded = () => setCurrentVideoIndex(prev => (prev + 1) % LOCAL_VIDEOS.length);
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(console.error);
    }
  }, [currentVideoIndex]);

  // --- Realtime (نفس المنطق السابق) ---
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

  // التنبيه عند تغير الأرقام
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center font-cairo">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md text-center">
          <Monitor className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-8">شاشة العرض المركزية</h1>
          <form onSubmit={(e) => { e.preventDefault(); if(password === 'screen123') setIsAuthenticated(true); else alert('خطأ'); }} className="space-y-6">
             <select className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600" value={selectedScreen} onChange={e=>setSelectedScreen(Number(e.target.value))}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>شاشة رقم {n}</option>)}
             </select>
             <input type="password" placeholder="كلمة المرور" className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600" value={password} onChange={e=>setPassword(e.target.value)} autoFocus/>
             <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  // تصفية العيادات للشاشة المختارة
  const screenClinics = clinics.filter(c => c.screen_id === clinics[selectedScreen - 1]?.screen_id);
  const currentDoctor = doctors[currentDoctorIndex];

  // --- الشاشة الرئيسية ---
  return (
    <div className={`min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col font-cairo relative`}>
      
      {/* 1. الشريط العلوي (تم التحديث حسب الطلب) */}
      <header className="bg-gradient-to-r from-blue-900 via-slate-800 to-slate-900 border-b border-slate-700 h-24 flex items-center justify-between px-6 shadow-lg z-20 shrink-0">
        
        {/* يمين: اسم المركز */}
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
             <Activity className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-blue-200 drop-shadow-sm">
             {settings?.center_name || 'المركز الطبي الذكي'}
           </h1>
        </div>

        {/* وسط: التنبيهات (اختياري) أو فارغ */}
        <div className="flex-1"></div>

        {/* يسار: التاريخ والوقت + أدوات التحكم */}
        <div className="flex items-center gap-6">
           <div className="text-left">
             <div className="text-2xl font-bold text-blue-300 font-mono tracking-wide">
                {getFormattedDateTime(currentTime)}
             </div>
           </div>
           
           <div className="h-10 w-px bg-slate-600 mx-2"></div>
           
           {/* أزرار التحكم السريعة */}
           <div className="flex gap-2">
              <button onClick={() => setShowDisplaySettings(!showDisplaySettings)} className={`p-2 rounded-lg transition ${showDisplaySettings ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}><Settings2/></button>
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg">{isMuted ? <VolumeX/> : <Volume2/>}</button>
              <button onClick={() => { if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); }} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg"><Maximize/></button>
              <button onClick={() => { setIsAuthenticated(false); setPassword(''); }} className="p-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg"><LogOut/></button>
           </div>
        </div>
      </header>

      {/* 2. نافذة الإعدادات العائمة (التحكم الكامل) */}
      {showDisplaySettings && (
        <div className="absolute top-28 left-6 w-80 bg-slate-800/95 backdrop-blur border border-slate-600 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
             <h3 className="font-bold flex items-center gap-2"><Settings2 className="w-4 h-4 text-blue-400"/> إعدادات العرض</h3>
             <button onClick={() => setShowDisplaySettings(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {/* الأعمدة */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">عدد الأعمدة</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setDisplayConfig({...displayConfig, gridCols: n})} className={`flex-1 py-1 text-sm rounded border ${displayConfig.gridCols === n ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>{n}</button>
                ))}
              </div>
            </div>

            {/* حجم الخط */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">حجم الخط</label>
              <div className="grid grid-cols-3 gap-1">
                {['xs','small','normal','large','xl'].map(s => (
                  <button key={s} onClick={() => setDisplayConfig({...displayConfig, textSize: s})} className={`py-1 text-xs rounded border ${displayConfig.textSize === s ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}>{s}</button>
                ))}
              </div>
            </div>

            {/* المسافات */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">المسافات بين الكروت</label>
              <div className="flex gap-1">
                 {['none','small','normal','large'].map(s => (
                   <button key={s} onClick={() => setDisplayConfig({...displayConfig, gapSize: s})} className={`flex-1 py-1 text-xs rounded border ${displayConfig.gapSize === s ? 'bg-blue-600' : 'bg-slate-700'}`}>{s}</button>
                 ))}
              </div>
            </div>

            {/* الحواف */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">حواف الشاشة (Padding)</label>
              <div className="flex gap-1">
                 {['none','small','normal','large'].map(s => (
                   <button key={s} onClick={() => setDisplayConfig({...displayConfig, paddingSize: s})} className={`flex-1 py-1 text-xs rounded border ${displayConfig.paddingSize === s ? 'bg-blue-600' : 'bg-slate-700'}`}>{s}</button>
                 ))}
              </div>
            </div>

            {/* نسبة أبعاد الكارت */}
            <div>
               <label className="text-xs text-slate-400 mb-1 block">أبعاد الكارت</label>
               <select className="w-full bg-slate-700 border border-slate-600 rounded p-1 text-sm" value={displayConfig.aspectRatio} onChange={(e) => setDisplayConfig({...displayConfig, aspectRatio: e.target.value})}>
                 <option value="aspect-auto">تلقائي (Auto)</option>
                 <option value="aspect-video">عريض (16:9)</option>
                 <option value="aspect-square">مربع (1:1)</option>
                 <option value="aspect-[4/3]">تقليدي (4:3)</option>
                 <option value="aspect-[3/4]">طولي (3:4)</option>
               </select>
            </div>

            {/* إظهار/إخفاء أقسام */}
            <div className="pt-2 border-t border-slate-600">
               <label className="flex items-center justify-between text-sm cursor-pointer hover:bg-slate-700 p-2 rounded">
                 <span>عرض الفيديو الجانبي</span>
                 <input type="checkbox" checked={displayConfig.showVideo} onChange={(e) => setDisplayConfig({...displayConfig, showVideo: e.target.checked})} className="accent-blue-600"/>
               </label>
               <label className="flex items-center justify-between text-sm cursor-pointer hover:bg-slate-700 p-2 rounded">
                 <span>عرض قسم الطبيب</span>
                 <input type="checkbox" checked={displayConfig.showDoctor} onChange={(e) => setDisplayConfig({...displayConfig, showDoctor: e.target.checked})} className="accent-blue-600"/>
               </label>
            </div>
          </div>
        </div>
      )}

      {/* 3. منطقة المحتوى الرئيسية */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* منطقة الكروت (العيادات) */}
        <div className={`transition-all duration-500 flex flex-col ${displayConfig.showVideo ? 'w-2/3 border-l border-slate-700' : 'w-full'}`}>
           <div className={`flex-1 overflow-y-auto ${getPaddingClass()}`}>
              <div className={`grid ${getGridClass()} ${getGapClass()}`}>
                 {screenClinics.map(clinic => (
                   <div key={clinic.id} className={`relative bg-white text-slate-900 rounded-xl overflow-hidden shadow-xl flex flex-col ${displayConfig.aspectRatio} ${clinic.is_active ? '' : 'opacity-60 grayscale'} ${notification?.targetClinicId === clinic.id ? 'ring-8 ring-yellow-400 animate-pulse' : ''}`}>
                      <div className={`absolute top-0 right-0 bottom-0 w-3 ${clinic.is_active ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                         <h2 className={`font-bold mb-2 ${textStyles.title} text-slate-800`}>{clinic.clinic_name}</h2>
                         <div className={`font-black text-blue-600 leading-none ${textStyles.number}`}>
                            {toArabicNumbers(clinic.current_number)}
                         </div>
                      </div>
                      
                      <div className="bg-slate-100 p-3 flex justify-between items-center border-t border-slate-200">
                         <div className={`font-bold ${textStyles.meta} ${clinic.is_active ? 'text-green-600' : 'text-slate-500'}`}>
                           {clinic.is_active ? '● متاح الآن' : '● مغلق'}
                         </div>
                         <div className={`font-mono text-slate-500 dir-ltr ${textStyles.meta}`}>
                           {clinic.last_call_time ? new Date(clinic.last_call_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* قسم الطبيب (السفلي) */}
           {displayConfig.showDoctor && currentDoctor && (
             <div className="h-40 bg-slate-800 border-t border-slate-700 flex items-center px-8 shrink-0 relative overflow-hidden">
                <div className="absolute right-0 top-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg z-10 font-bold">الطبيب المناوب</div>
                <div className="w-24 h-24 rounded-full border-4 border-blue-500 overflow-hidden bg-white relative z-10 shrink-0">
                   {(currentDoctor as any).image_url ? (
                      <img src={(currentDoctor as any).image_url} className="w-full h-full object-cover" />
                   ) : (
                      <User className="w-full h-full p-4 text-slate-300"/>
                   )}
                </div>
                <div className="mr-6 z-10">
                   <h3 className="text-3xl font-bold text-white mb-1">{currentDoctor.full_name}</h3>
                   <p className="text-xl text-blue-300">{currentDoctor.specialization}</p>
                </div>
                <User className="absolute left-10 -bottom-10 w-64 h-64 text-white/5 rotate-12"/>
             </div>
           )}
        </div>

        {/* منطقة الفيديو (اختياري) */}
        {displayConfig.showVideo && (
          <div className="w-1/3 bg-black relative flex items-center justify-center">
             <video ref={videoRef} className="w-full h-full object-contain" src={LOCAL_VIDEOS[currentVideoIndex]} muted={isMuted} onEnded={handleVideoEnded} autoPlay playsInline />
          </div>
        )}
      </div>

      {/* شريط الأخبار السفلي */}
      <div className="h-12 bg-blue-900 flex items-center shrink-0 border-t border-blue-700 relative z-30">
         <div className="bg-blue-800 h-full px-6 flex items-center font-bold text-lg z-20 shadow-xl">
           أخبار المركز
         </div>
         <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="whitespace-nowrap animate-marquee text-xl px-4 absolute w-full font-medium" style={{ animationDuration: `${settings?.news_ticker_speed || 30}s` }}>
               {settings?.news_ticker_content || 'مرحباً بكم في المركز الطبي... نتمنى لكم الشفاء العاجل'}
            </div>
         </div>
      </div>

      {/* أنماط CSS إضافية */}
      <style jsx global>{`
         @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
         .animate-marquee { animation: marquee linear infinite; }
         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
      `}</style>

      {/* التنبيه المنبثق (Notification Overlay) */}
      {notification && (
        <div className={`fixed top-24 inset-x-0 z-50 p-4 transition-transform duration-500 ${notification.show ? 'translate-y-0' : '-translate-y-full'}`}>
           <div className={`mx-auto max-w-4xl shadow-2xl rounded-2xl p-6 border-4 flex items-center justify-center gap-6 ${notification.type === 'emergency' ? 'bg-red-600 border-red-800' : 'bg-amber-500 border-amber-700'}`}>
              <Bell className="w-16 h-16 text-white animate-bounce" />
              <h2 className="text-5xl font-black text-white drop-shadow-lg">{notification.message}</h2>
           </div>
        </div>
      )}

    </div>
  );
}

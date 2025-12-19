'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings, useDoctors } from '@/lib/hooks'; 
import { supabase } from '@/lib/supabase';
import { 
  Lock, LogOut, Maximize, Volume2, VolumeX, Bell, 
  Activity, Ban, Clock, User, ZoomIn, ZoomOut, AlertTriangle, 
  ArrowRightLeft, Users, Settings2, LayoutGrid, Type, Monitor, MoveHorizontal, Tv
} from 'lucide-react';
import { toArabicNumbers, getArabicDate, getArabicTime, playSequentialAudio, playAudio } from '@/lib/utils'; 

const PATH_PREFIX = '/videos'; 
const VIDEOS_COUNT = 28; 
const LOCAL_VIDEOS = Array.from({ length: VIDEOS_COUNT }, (_, i) => `${PATH_PREFIX}/${i + 1}.mp4`);

export default function DisplayScreen() {
  const router = useRouter();
  
  // Data State
  const [screensList, setScreensList] = useState<any[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<any>(null); // الشاشة المختارة
  const [clinics, setClinics] = useState<any[]>([]);
  
  // UI State
  const [viewMode, setViewMode] = useState<'selection' | 'display'>('selection');
  const [passwordInput, setPasswordInput] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Settings & Helpers
  const { doctors } = useDoctors(); 
  const { settings } = useSettings();
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [displayConfig, setDisplayConfig] = useState({ aspectRatio: 'aspect-[3/2]', gridCols: 2, textSize: 'normal', gapSize: 'normal' });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [notification, setNotification] = useState<any>(null);
  const prevClinicsRef = useRef<any[]>([]);

  useEffect(() => { setIsClient(true); fetchScreens(); }, []);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);

  // Fetch Available Screens
  const fetchScreens = async () => {
    const { data } = await supabase.from('screens').select('*').eq('is_active', true).order('screen_number');
    setScreensList(data || []);
  };

  // Login to Specific Screen
  const handleScreenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScreen) return;

    if (passwordInput === selectedScreen.password) {
      setViewMode('display');
      fetchScreenClinics(selectedScreen.id);
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  // Fetch Clinics for the logged-in screen
  const fetchScreenClinics = async (screenId: string) => {
    // 1. Get Clinic IDs linked to this screen
    const { data: relations } = await supabase.from('clinic_screens').select('clinic_id').eq('screen_id', screenId);
    const clinicIds = relations?.map((r: any) => r.clinic_id) || [];

    if (clinicIds.length > 0) {
      // 2. Fetch Clinics Data
      const { data: clinicsData } = await supabase.from('clinics').select('*').in('id', clinicIds).order('clinic_number');
      setClinics(clinicsData || []);
    } else {
      setClinics([]);
    }
  };

  // Real-time Updates for Clinics
  useEffect(() => {
    if (viewMode !== 'display' || !selectedScreen) return;

    const channel = supabase.channel('display-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinics' }, () => {
        fetchScreenClinics(selectedScreen.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [viewMode, selectedScreen]);

  // Audio & Notification Logic (Same as before)
  useEffect(() => {
    if (viewMode !== 'display') return;
    
    // Check for changes to trigger audio
    clinics.forEach(clinic => {
      const prev = prevClinicsRef.current.find(c => c.id === clinic.id);
      if (prev && clinic.last_call_time !== prev.last_call_time && clinic.last_call_time) {
        triggerAlert(clinic);
      }
    });
    prevClinicsRef.current = clinics;
  }, [clinics, viewMode]);

  // Helpers
  const triggerAlert = async (clinic: any) => {
    setNotification({ show: true, message: `العميل رقم ${toArabicNumbers(clinic.current_number)} -> ${clinic.clinic_name}`, type: 'normal', targetClinicId: clinic.id });
    if (!isMuted) { try { await playSequentialAudio(['/audio/ding.mp3', `/audio/${clinic.current_number}.mp3`, `/audio/clinic${clinic.clinic_number}.mp3`]); } catch (e) { console.error(e); } }
    setTimeout(() => setNotification(null), 10000);
  };
  
  const handleVideoEnded = () => setCurrentVideoIndex(p => (p + 1) % LOCAL_VIDEOS.length);
  const handleFullscreen = () => { if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); } else { document.exitFullscreen(); setIsFullscreen(false); } };

  // --- RENDER ---

  if (!isClient) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">جاري التحميل...</div>;

  // MODE 1: SCREEN SELECTION
  if (viewMode === 'selection') {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-cairo flex flex-col items-center justify-center p-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-black pointer-events-none"></div>
        
        <h1 className="text-4xl font-bold mb-12 flex items-center gap-4 z-10">
          <Monitor className="w-12 h-12 text-blue-500" />
          شاشات العرض المتاحة
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl z-10">
          {screensList.map(screen => (
            <button 
              key={screen.id}
              onClick={() => setSelectedScreen(screen)}
              className="bg-slate-800 hover:bg-blue-900 border border-slate-700 hover:border-blue-500 p-8 rounded-2xl transition-all group flex flex-col items-center gap-4 shadow-xl hover:scale-105"
            >
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Tv className="w-10 h-10 text-slate-300 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-bold">{screen.screen_name}</h2>
              <span className="text-slate-400 bg-slate-900 px-3 py-1 rounded text-sm">شاشة رقم {screen.screen_number}</span>
            </button>
          ))}
        </div>

        {/* Login Modal */}
        {selectedScreen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md relative animate-in zoom-in-95">
              <button onClick={() => { setSelectedScreen(null); setPasswordInput(''); }} className="absolute top-4 left-4 text-slate-400 hover:text-red-500"><Activity className="rotate-45"/></button>
              <h3 className="text-2xl font-bold mb-6 text-center">دخول: {selectedScreen.screen_name}</h3>
              <form onSubmit={handleScreenLogin} className="space-y-4">
                <input 
                  type="password" 
                  autoFocus
                  placeholder="أدخل كلمة مرور الشاشة" 
                  value={passwordInput} 
                  onChange={e => setPasswordInput(e.target.value)} 
                  className="w-full text-center text-2xl font-bold border-2 border-slate-200 rounded-xl py-4 focus:border-blue-600 outline-none tracking-widest"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg">دخول العرض</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // MODE 2: DISPLAY CONTENT (The actual screen)
  return (
    <div className={`min-h-screen bg-gray-900 text-white overflow-hidden relative flex flex-col font-cairo`}>
      {/* Notification Slider */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-500 ease-out ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`shadow-2xl border-b-8 border-white p-4 flex justify-center items-center h-28 bg-gradient-to-r from-amber-500 to-orange-600`}>
          <div className="flex items-center gap-4 w-full max-w-7xl justify-center">
            <Bell className="w-8 h-8 text-white animate-bounce" />
            <h2 className="text-4xl font-black text-white drop-shadow-lg">{notification?.message}</h2>
          </div>
        </div>
      </div>

      {/* Top Bar (Simplified) */}
      <div className="h-20 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shadow-md z-40">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 px-4 py-2 rounded-lg font-bold">{selectedScreen?.screen_name}</div>
          <div className="h-8 w-[1px] bg-slate-600"></div>
          <div className="flex items-center gap-4 text-xl font-mono text-slate-300">
            <Clock className="w-5 h-5 text-blue-400"/> {getArabicTime(currentTime)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Settings Toggle */}
          <button onClick={() => setShowDisplaySettings(!showDisplaySettings)} className="p-2 hover:bg-slate-700 rounded"><Settings2 className="w-6 h-6 text-slate-400"/></button>
          
          {/* Controls */}
          <button onClick={() => setIsZoomed(!isZoomed)} className="p-2 hover:bg-slate-700 rounded"><ZoomIn className="w-6 h-6 text-slate-400"/></button>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-slate-700 rounded">{isMuted ? <VolumeX className="text-red-400"/> : <Volume2 className="text-slate-400"/>}</button>
          <button onClick={handleFullscreen} className="p-2 hover:bg-slate-700 rounded"><Maximize className="text-slate-400"/></button>
          
          {/* Logout Button */}
          <button onClick={() => { setViewMode('selection'); setSelectedScreen(null); setPasswordInput(''); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ml-4">
            <LogOut className="w-4 h-4"/> خروج
          </button>
        </div>

        {/* Display Settings Popup */}
        {showDisplaySettings && (
          <div className="absolute top-20 left-6 bg-slate-800 border border-slate-600 p-4 rounded-xl shadow-xl w-64 z-50">
             <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">الأعمدة</label>
                  <div className="flex gap-1">{[1, 2, 3].map(n => <button key={n} onClick={() => setDisplayConfig({...displayConfig, gridCols: n})} className={`flex-1 py-1 text-sm border rounded ${displayConfig.gridCols === n ? 'bg-blue-600 border-blue-500' : 'border-slate-600'}`}>{n}</button>)}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">حجم الخط</label>
                  <div className="flex gap-1">{['small', 'normal', 'large'].map(s => <button key={s} onClick={() => setDisplayConfig({...displayConfig, textSize: s})} className={`flex-1 py-1 text-xs border rounded ${displayConfig.textSize === s ? 'bg-blue-600 border-blue-500' : 'border-slate-600'}`}>{s}</button>)}</div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Main Content: Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Clinics Grid */}
        <div className={`${isZoomed ? 'w-1/2' : 'w-1/3'} border-l border-slate-700 flex flex-col transition-all duration-500`}>
          <div className="flex-1 p-4 overflow-y-auto bg-slate-800/50">
            {clinics.length > 0 ? (
              <div className={`grid gap-4 ${displayConfig.gridCols === 1 ? 'grid-cols-1' : displayConfig.gridCols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {clinics.map(clinic => (
                  <div key={clinic.id} className={`bg-white rounded-xl overflow-hidden flex flex-col justify-between shadow-lg relative ${clinic.is_active ? '' : 'opacity-60 grayscale'} ${displayConfig.aspectRatio} ${notification?.targetClinicId === clinic.id ? 'animate-pulse ring-4 ring-yellow-400' : ''}`}>
                    <div className={`h-2 w-full ${clinic.is_active ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                    <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
                      <h3 className={`font-bold text-slate-800 mb-2 ${displayConfig.textSize === 'large' ? 'text-3xl' : 'text-xl'}`}>{clinic.clinic_name}</h3>
                      <span className={`font-black text-blue-600 ${displayConfig.textSize === 'large' ? 'text-8xl' : 'text-6xl'}`}>{toArabicNumbers(clinic.current_number)}</span>
                    </div>
                    <div className="bg-slate-50 p-2 text-center border-t text-slate-500 text-xs font-mono">
                      {clinic.is_active ? 'نشطة' : 'متوقفة'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">لا توجد عيادات مرتبطة بهذه الشاشة</div>
            )}
          </div>
          
          {/* Doctor Info Footer */}
          <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 relative overflow-hidden flex items-center p-6">
             {doctors.length > 0 && doctors[currentDoctorIndex] ? (
               <div className="flex items-center gap-6 animate-fade-in w-full">
                 <div className="w-24 h-24 rounded-full border-2 border-blue-500 overflow-hidden bg-white flex items-center justify-center">
{/* استخدام (as any) يجبر النظام على تجاهل فحص النوع لهذا السطر */}
{(doctors[currentDoctorIndex] as any).image_url ? (
  <img src={(doctors[currentDoctorIndex] as any).image_url} className="w-full h-full object-cover"/>
) : (
  <User className="w-12 h-12 text-slate-300"/>
)}                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-1">{doctors[currentDoctorIndex].full_name}</h3>
                   <p className="text-blue-400 flex items-center gap-2"><Activity className="w-4 h-4"/> {doctors[currentDoctorIndex].specialization}</p>
                 </div>
               </div>
             ) : <div className="text-slate-500 w-full text-center">جاري تحميل بيانات الأطباء...</div>}
          </div>
        </div>

        {/* Right: Video Player */}
        <div className={`${isZoomed ? 'w-1/2' : 'w-2/3'} bg-black relative flex items-center justify-center transition-all duration-500`}>
          <video 
            ref={videoRef}
            className="w-full h-full object-contain" 
            muted={isMuted} 
            autoPlay
            playsInline
            src={LOCAL_VIDEOS[currentVideoIndex]} 
            onEnded={handleVideoEnded}
          />
        </div>
      </div>

      {/* Ticker */}
      <div className="h-12 bg-blue-900 border-t border-blue-800 flex items-center overflow-hidden">
        <div className="bg-blue-800 h-full px-6 flex items-center shadow-xl z-10"><span className="font-bold text-white">إعلانات</span></div>
        <div className="flex-1 overflow-hidden relative h-full">
           <div className="absolute top-2 whitespace-nowrap animate-marquee text-lg font-medium px-4 w-full">
             {settings?.news_ticker_content || 'مرحباً بكم في المركز الطبي...'}
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee ${settings?.news_ticker_speed || 30}s linear infinite; }
      `}</style>
    </div>
  );
}

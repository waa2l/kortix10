'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings, useDoctors } from '@/lib/hooks'; // أضفنا useDoctors
import { 
  Lock, LogOut, Maximize, Minimize, Volume2, VolumeX, Bell, 
  Activity, Ban, CheckCircle, Clock, User
} from 'lucide-react';
import { 
  toArabicNumbers, getArabicDate, getArabicTime, playSequentialAudio 
} from '@/lib/utils'; //

export default function DisplayScreen() {
  const router = useRouter();
  
  // Hooks
  const { clinics, loading: clinicsLoading } = useClinics();
  const { doctors, loading: doctorsLoading } = useDoctors(); // جلب الأطباء
  const { settings } = useSettings();

  // States
  const [isClient, setIsClient] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(1);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Doctor Rotator State
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);

  // Notification State
  const [notification, setNotification] = useState<{ show: boolean; message: string; subtext: string } | null>(null);
  
  // Ref for tracking changes
  const prevClinicsRef = useRef<typeof clinics>([]);

  // Initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Doctor Rotator Timer (Every 10 Seconds)
  useEffect(() => {
    if (doctors.length > 0) {
      const doctorTimer = setInterval(() => {
        setCurrentDoctorIndex((prev) => (prev + 1) % doctors.length);
      }, 10000); // 10 ثواني
      return () => clearInterval(doctorTimer);
    }
  }, [doctors]);

  // Realtime Updates & Notifications Logic
  useEffect(() => {
    if (!isAuthenticated || clinicsLoading) return;

    clinics.forEach((clinic) => {
      const prevClinic = prevClinicsRef.current.find((c) => c.id === clinic.id);
      
      // Check for new calls
      if (prevClinic && clinic.last_call_time !== prevClinic.last_call_time && clinic.last_call_time) {
        const callTime = new Date(clinic.last_call_time).getTime();
        const now = new Date().getTime();
        
        if (now - callTime < 10000) {
          triggerAlert(clinic);
        }
      }
    });

    prevClinicsRef.current = clinics;
  }, [clinics, isAuthenticated, isMuted]);

  const triggerAlert = async (clinic: any) => {
    // 1. Show Visual Notification
    setNotification({
      show: true,
      message: `العميل رقم ${toArabicNumbers(clinic.current_number)}`,
      subtext: `يرجى التوجه إلى ${clinic.clinic_name}`
    });

    setTimeout(() => {
      setNotification(null);
    }, 10000);

    // 2. Play Audio
    if (!isMuted) {
      const audioFiles = [
        '/audio/ding.mp3',
        `/audio/${clinic.current_number}.mp3`,
        `/audio/clinic${clinic.clinic_number}.mp3`
      ];

      try {
        await playSequentialAudio(audioFiles);
      } catch (error) {
        console.error("Audio playback error:", error);
      }
    }
  };

  // Auth Handlers
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'screen123') { // كلمة مرور ثابتة للتجربة كما في الكود الأصلي
      setIsAuthenticated(true);
      setPassword('');
      prevClinicsRef.current = clinics;
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

  // Loading Screen
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

  // Login Screen
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

  // Filter clinics for current screen
  const screenClinics = clinics.filter((c) => c.screen_id === clinics[selectedScreen - 1]?.screen_id);
  
  // Current Doctor Data
  const currentDoctor = doctors[currentDoctorIndex % doctors.length];

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative flex flex-col font-cairo">
      
      {/* === Notification Slider === */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-500 ease-out ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 shadow-2xl border-b-4 border-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-white p-3 rounded-full animate-bounce">
               <Bell className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white drop-shadow-md mb-1">{notification?.message}</h2>
              <p className="text-2xl text-amber-100 font-semibold">{notification?.subtext}</p>
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
          <div className="flex bg-slate-700 rounded-lg p-1">
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
        
        {/* --- Left Column (1/3): Clinics List --- */}
        <div className="w-1/3 bg-slate-100/5 backdrop-blur-sm border-l border-slate-700 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
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
                    ? 'bg-white border-blue-100 transform hover:scale-[1.02]' 
                    : 'bg-slate-200 border-slate-300 opacity-60 grayscale'
                  }
                `}
              >
                {/* Active Indicator Strip */}
                <div className={`absolute right-0 top-0 bottom-0 w-2 ${clinic.is_active ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                
                <div className="p-5 pr-7">
                  {/* Top Line: Name & Number */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-2xl font-bold ${clinic.is_active ? 'text-slate-800' : 'text-slate-600'}`}>
                      {clinic.clinic_name}
                    </h3>
                    <span className={`text-6xl font-black ${clinic.is_active ? 'text-blue-600' : 'text-slate-500'}`}>
                      {toArabicNumbers(clinic.current_number)}
                    </span>
                  </div>
                  
                  {/* Bottom Line: Time & Status */}
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

        {/* --- Right Column (2/3): Video & Doctor --- */}
        <div className="w-2/3 flex flex-col bg-black">
          
          {/* Top: Educational Video (Flex Grow) */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 pointer-events-none"></div>
            
            {/* Placeholder for Video Player */}
            <div className="text-center z-0 opacity-50">
               <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center mx-auto mb-4">
                 <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[30px] border-l-slate-600 border-b-[15px] border-b-transparent ml-2"></div>
               </div>
               <p className="text-slate-500 text-xl">فيديو توعوي</p>
            </div>
            
            {/* Overlay for "Now Serving" optional feature if needed */}
          </div>

          {/* Bottom: Doctor Rotator (Fixed Height) */}
          <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 relative overflow-hidden">
             {doctors.length > 0 && currentDoctor ? (
               <div key={currentDoctor.id} className="h-full flex items-center p-6 animate-slide-in-bottom">
                 {/* Doctor Image */}
                 <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden shadow-2xl flex-shrink-0 bg-white">
                   {/* Replace with actual image tag if available */}
                   <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                     <User className="w-16 h-16" />
                   </div>
                 </div>
                 
                 {/* Doctor Info */}
                 <div className="mr-8 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">الطبيب المناوب</span>
                       <div className="h-1 w-20 bg-blue-500/30 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 animate-pulse w-full"></div>
                       </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">{currentDoctor.full_name}</h2>
                    <p className="text-xl text-blue-300 flex items-center gap-2">
                      <Activity className="w-5 h-5"/>
                      {currentDoctor.specialization}
                    </p>
                 </div>

                 {/* Decorative Background Icon */}
                 <User className="absolute -left-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
               </div>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-500">
                 <p>جاري تحميل بيانات الأطباء...</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* === Footer: News Ticker === */}
      <div className="h-14 bg-blue-900 border-t border-blue-700 flex items-center relative overflow-hidden shadow-lg z-50">
         <div className="bg-blue-800 h-full px-6 flex items-center z-10 shadow-lg">
            <span className="text-white font-bold whitespace-nowrap">شريط الأخبار</span>
         </div>
         <div className="absolute whitespace-nowrap animate-slide-left text-white text-xl font-medium px-4 w-full" style={{ animationDuration: `${settings?.news_ticker_speed || 30}s` }}>
            {settings?.news_ticker_content}
         </div>
      </div>
      
      {/* Custom Styles for Animation */}
      <style jsx global>{`
        @keyframes slideInBottom {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-bottom {
          animation: slideInBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

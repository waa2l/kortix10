'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useSettings } from '@/lib/hooks';
import { Lock, LogOut, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { formatDate, formatTime, toArabicNumbers, getArabicDate, getArabicTime } from '@/lib/utils';

export default function DisplayScreen() {
  const router = useRouter();
  const { clinics, loading: clinicsLoading } = useClinics();
  const { settings } = useSettings();
  const [isClient, setIsClient] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(1);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const doctorTimer = setInterval(() => {
      setCurrentDoctorIndex((prev) => (prev + 1) % 10);
    }, 10000);
    return () => clearInterval(doctorTimer);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, verify password with backend
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
          <div className="spinner mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">شاشة العرض</h1>
            <p className="text-gray-600 mt-2">أدخل كلمة المرور للدخول</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  const screenClinics = clinics.filter((c) => c.screen_id === clinics[selectedScreen - 1]?.screen_id);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-4 flex items-center justify-between border-b-2 border-blue-500">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{settings?.center_name}</h1>
          <div className="text-lg">
            <span>{getArabicDate(currentTime)}</span>
            <span className="mx-2">|</span>
            <span>{getArabicTime(currentTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedScreen}
            onChange={(e) => setSelectedScreen(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                شاشة {toArabicNumbers(num)}
              </option>
            ))}
          </select>

          <button
            onClick={handleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="كتم الصوت"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-700 rounded-lg transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Right Side - Clinic Cards */}
        <div className="w-1/4 bg-gray-900 border-l-2 border-blue-500 p-4 overflow-y-auto">
          <div className="space-y-4">
            {screenClinics.map((clinic) => (
              <div
                key={clinic.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  clinic.is_active
                    ? 'bg-gradient-to-r from-green-900 to-green-800 border-green-500'
                    : 'bg-gray-800 border-gray-600 opacity-50'
                }`}
              >
                <div className="text-center">
                  <p className="text-sm text-gray-300">{clinic.clinic_name}</p>
                  <p className="text-4xl font-bold text-white mt-2">{toArabicNumbers(clinic.current_number)}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {clinic.last_call_time ? formatTime(clinic.last_call_time) : 'لم يتم النداء'}
                  </p>
                </div>
              </div>
            ))}

            {/* QR Code Card */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 border-2 border-blue-500 mt-6">
              <p className="text-center text-sm text-gray-300 mb-2">QR Code</p>
              <div className="bg-white p-2 rounded">
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-600">
                  QR Code
                </div>
              </div>
            </div>

            {/* Doctor Photos */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900 to-purple-800 border-2 border-purple-500 mt-4">
              <p className="text-center text-sm text-gray-300 mb-2">الأطباء</p>
              <div className="bg-gray-700 p-4 rounded h-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">د. أحمد محمد</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Main Display */}
        <div className="flex-1 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
              {screenClinics.length > 0 ? toArabicNumbers(screenClinics[0]?.current_number || 0) : '0'}
            </p>
            <p className="text-4xl text-white mb-4">
              {screenClinics.length > 0 ? screenClinics[0]?.clinic_name : 'لا توجد عيادات'}
            </p>
            <p className="text-2xl text-gray-400">يرجى التوجه إلى العيادة المذكورة</p>
          </div>
        </div>

        {/* Left Side - Video Player */}
        <div className="w-1/4 bg-gray-900 border-r-2 border-blue-500 p-4">
          <div className="bg-black rounded-lg h-full flex items-center justify-center border-2 border-gray-700">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-4">مشغل الفيديوهات</p>
              <div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center">
                <p className="text-gray-600">فيديو توعوي</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom News Ticker */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 h-16 border-t-2 border-red-500 flex items-center overflow-hidden">
        <div className="animate-slide-left whitespace-nowrap text-white text-2xl font-bold px-8">
          {settings?.news_ticker_content}
        </div>
      </div>
    </div>
  );
}

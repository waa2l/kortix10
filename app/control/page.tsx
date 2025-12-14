'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useQueue } from '@/lib/hooks';
import { Lock, LogOut, Play, RotateCcw, AlertTriangle, Send, Pause, Bell } from 'lucide-react';
import { toArabicNumbers, playSequentialAudio } from '@/lib/utils';

export default function ControlPanel() {
  const router = useRouter();
  
  // Hooks
  const { clinics, loading: clinicsLoading, updateClinic } = useClinics();
  const [selectedClinic, setSelectedClinic] = useState('');
  
  // States
  const [isClient, setIsClient] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ show: boolean; message: string } | null>(null);

  // Refs
  const prevClinicsRef = useRef<typeof clinics>([]);

  // Initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Realtime Notification Logic (Listening to updates) ---
  useEffect(() => {
    if (!isAuthenticated || clinicsLoading) return;

    clinics.forEach((clinic) => {
      const prevClinic = prevClinicsRef.current.find((c) => c.id === clinic.id);
      
      // الكشف عن تغير وقت النداء
      if (prevClinic && clinic.last_call_time !== prevClinic.last_call_time && clinic.last_call_time) {
        const callTime = new Date(clinic.last_call_time).getTime();
        const now = new Date().getTime();
        
        // إذا كان النداء حديثاً (أقل من 10 ثواني) والعيادة المختارة هي الحالية أو عيادة أخرى
        if (now - callTime < 10000) {
          triggerControlAlert(clinic);
        }
      }
    });

    prevClinicsRef.current = clinics;
  }, [clinics, isAuthenticated]);

  const triggerControlAlert = async (clinic: any) => {
    // 1. إظهار التنبيه المرئي للموظف
    setNotification({
      show: true,
      message: `تم نداء رقم ${toArabicNumbers(clinic.current_number)} - ${clinic.clinic_name}`
    });
    
    setTimeout(() => setNotification(null), 5000);

    // 2. تشغيل الصوت (اختياري في صفحة التحكم، لكن مفيد للتأكد من عمل النظام)
    // إذا كنت لا تريد الصوت في صفحة التحكم، احذف هذا الجزء
    const audioFiles = [
      '/audio/ding.mp3',
      `/audio/${clinic.current_number}.mp3`,
      `/audio/clinic${clinic.clinic_number}.mp3`
    ];
    try {
      await playSequentialAudio(audioFiles);
    } catch (e) { console.error("Audio playback error", e); }
  };

  // --- Handlers ---

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (!clinic) {
      setError('يرجى اختيار عيادة');
      return;
    }

    if (password === clinic.control_password) {
      setIsAuthenticated(true);
      setPassword('');
      prevClinicsRef.current = clinics; // Reset ref on login
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const handleNextPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic) {
      try {
        const newNumber = clinic.current_number + 1;
        await updateClinic(clinic.id, { 
          current_number: newNumber,
          last_call_time: new Date().toISOString()
        });
      } catch (err) {
        console.error('Update failed', err);
        alert('فشل التحديث، حاول مرة أخرى');
      }
    }
  };

  const handlePreviousPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
      try {
        await updateClinic(clinic.id, { 
          current_number: clinic.current_number - 1 
        });
      } catch (err) {
        console.error('Update failed', err);
      }
    }
  };

  const handleRepeatCall = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
       try {
          // تحديث الوقت فقط لإعادة إطلاق التنبيه
          await updateClinic(clinic.id, { 
            last_call_time: new Date().toISOString() 
          });
        } catch (err) {
          console.error('Repeat call failed', err);
        }
    }
  };

  const handleReset = async () => {
    if (confirm('هل أنت متأكد من تصفير عداد العيادة؟')) {
      const clinic = clinics.find((c) => c.id === selectedClinic);
      if (clinic) {
        try {
          await updateClinic(clinic.id, { 
            current_number: 0,
            last_call_time: null
          });
        } catch (err) {
          console.error('Reset failed', err);
        }
      }
    }
  };

  const handleEmergency = async () => {
    alert('تنبيه الطوارئ: سيتم إرسال إشعار لجميع الشاشات (يتطلب تفعيل المنطق في قاعدة البيانات)');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedClinic('');
    setPassword('');
  };

  // --- Render ---

  if (!isClient || clinicsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="text-center text-white">
          <div className="spinner mb-4 border-white border-t-transparent"></div>
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
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-gray-600 mt-2">اختر العيادة وأدخل كلمة المرور</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اختر العيادة</label>
              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- اختر عيادة --</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.clinic_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  const clinic = clinics.find((c) => c.id === selectedClinic);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8 relative overflow-hidden font-cairo">
      
      {/* Notification Bar */}
      <div className={`fixed top-0 left-0 w-full z-50 transform transition-transform duration-300 ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-green-600 p-4 shadow-lg flex items-center justify-center gap-3">
          <Bell className="w-6 h-6 text-white animate-bounce" />
          <p className="text-xl font-bold text-white">{notification?.message}</p>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{clinic?.clinic_name}</h1>
            <p className="text-gray-400">الرقم الحالي: {toArabicNumbers(clinic?.current_number || 0)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>

        {/* Main Display */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-12 text-center mb-8 border-2 border-blue-500 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/10 blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <p className="text-gray-300 text-lg mb-4 relative z-10">الرقم الحالي</p>
          <p className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 relative z-10 drop-shadow-lg">
            {toArabicNumbers(clinic?.current_number || 0)}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Next Patient */}
        <button
          onClick={handleNextPatient}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 p-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 shadow-lg border-b-4 border-green-900"
        >
          <Play className="w-8 h-8" />
          <span className="text-2xl font-bold">العميل التالي</span>
        </button>

        {/* Previous Patient */}
        <button
          onClick={handlePreviousPatient}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 shadow-lg border-b-4 border-blue-900"
        >
          <RotateCcw className="w-8 h-8" />
          <span className="text-2xl font-bold">العميل السابق</span>
        </button>

        {/* Repeat Call */}
        <button
          onClick={handleRepeatCall}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 shadow-lg border-b-4 border-purple-900"
        >
          <Send className="w-8 h-8" />
          <span className="text-2xl font-bold">تكرار النداء</span>
        </button>

        {/* Reset Clinic */}
        <button
          onClick={handleReset}
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 p-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 shadow-lg border-b-4 border-orange-900"
        >
          <RotateCcw className="w-8 h-8" />
          <span className="text-2xl font-bold">تصفير العيادة</span>
        </button>

        {/* Pause Clinic */}
        <button
          onClick={() => alert('إيقاف العيادة (غير مفعل حالياً)')}
          className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 p-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 shadow-lg border-b-4 border-yellow-900"
        >
          <Pause className="w-8 h-8" />
          <span className="text-2xl font-bold">إيقاف العيادة</span>
        </button>

        {/* Emergency Alert */}
        <button
          onClick={handleEmergency}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 p-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 shadow-lg border-b-4 border-red-900 animate-pulse"
        >
          <AlertTriangle className="w-8 h-8" />
          <span className="text-2xl font-bold">تنبيه طوارئ</span>
        </button>
      </div>

      {/* Additional Controls */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Call Specific Patient */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            نداء عميل معين
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="رقم العميل"
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded-lg transition-colors font-bold shadow-md">
              نداء
            </button>
          </div>
        </div>

        {/* Transfer Patient */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-400" />
            تحويل عميل
          </h3>
          <div className="flex gap-2">
            <select className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
              <option>-- اختر عيادة --</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clinic_name}
                </option>
              ))}
            </select>
            <button className="bg-purple-600 hover:bg-purple-700 px-8 py-2 rounded-lg transition-colors font-bold shadow-md">
              تحويل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClinics, useQueue } from '@/lib/hooks';
import { Lock, LogOut, Play, RotateCcw, AlertTriangle, Send, Pause } from 'lucide-react';
import { toArabicNumbers, playAudio, getAudioFile } from '@/lib/utils'; // تأكد من استيراد دوال الصوت إذا كنت تريد تشغيل الصوت

export default function ControlPanel() {
  const router = useRouter();
  // إضافة updateClinic هنا
  const { clinics, loading: clinicsLoading, updateClinic } = useClinics();
  const [isClient, setIsClient] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  // يتم استخدام queue إذا كنت تريد إدارة قائمة الانتظار، لكن التحكم الأساسي في الرقم يتم عبر العيادة
  const { queue } = useQueue(selectedClinic);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  // 1. تفعيل زر العميل التالي
  const handleNextPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic) {
      try {
        const newNumber = clinic.current_number + 1;
        
        // تحديث قاعدة البيانات
        await updateClinic(clinic.id, { 
          current_number: newNumber,
          last_call_time: new Date().toISOString()
        });

        // تشغيل الصوت (اختياري - يتم عادة في شاشة العرض، لكن يمكن تشغيله هنا للموظف)
        // const audioFile = getAudioFile('number', newNumber);
        // await playAudio(audioFile);
        
      } catch (err) {
        console.error('فشل التحديث', err);
        alert('حدث خطأ أثناء تحديث الرقم');
      }
    }
  };

  // 2. تفعيل زر العميل السابق
  const handlePreviousPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic && clinic.current_number > 0) {
      try {
        await updateClinic(clinic.id, { 
          current_number: clinic.current_number - 1 
        });
      } catch (err) {
        console.error('فشل التحديث', err);
      }
    }
  };

  // 3. تفعيل زر التصفير
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
          console.error('فشل التصفير', err);
        }
      }
    }
  };

  // 4. تفعيل تكرار النداء (تحديث وقت النداء فقط ليظهر في الشاشات كأنه جديد)
  const handleRepeatCall = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinic);
    if (clinic) {
       try {
          await updateClinic(clinic.id, { 
            last_call_time: new Date().toISOString() // تحديث الوقت سيطلق التنبيه في الشاشات المراقبة للتغييرات
          });
        } catch (err) {
          console.error('فشل تكرار النداء', err);
        }
    }
  };

  const handleEmergency = async () => {
    alert('سيتم تفعيل نظام الطوارئ (يحتاج لتنفيذ منطق إضافي في قاعدة البيانات)');
    // يمكنك إضافة حقل is_emergency في جدول العيادات وتحديثه هنا
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedClinic('');
    setPassword('');
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

  const clinic = clinics.find((c) => c.id === selectedClinic);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
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
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-12 text-center mb-8 border-2 border-blue-500">
          <p className="text-gray-300 text-lg mb-4">الرقم الحالي</p>
          <p className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {toArabicNumbers(clinic?.current_number || 0)}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Next Patient */}
        <button
          onClick={handleNextPatient}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 p-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-4"
        >
          <Play className="w-8 h-8" />
          <span className="text-2xl font-bold">العميل التالي</span>
        </button>

        {/* Previous Patient */}
        <button
          onClick={handlePreviousPatient}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-4"
        >
          <RotateCcw className="w-8 h-8" />
          <span className="text-2xl font-bold">العميل السابق</span>
        </button>

        {/* Repeat Call */}
        <button
          onClick={handleRepeatCall}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-4"
        >
          <Send className="w-8 h-8" />
          <span className="text-2xl font-bold">تكرار النداء</span>
        </button>

        {/* Reset Clinic */}
        <button
          onClick={handleReset}
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 p-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-4"
        >
          <RotateCcw className="w-8 h-8" />
          <span className="text-2xl font-bold">تصفير العيادة</span>
        </button>

        {/* Pause Clinic */}
        <button
          onClick={() => alert('إيقاف العيادة (غير مفعل)')}
          className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 p-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-4"
        >
          <Pause className="w-8 h-8" />
          <span className="text-2xl font-bold">إيقاف العيادة</span>
        </button>

        {/* Emergency Alert */}
        <button
          onClick={handleEmergency}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 p-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-4 animate-pulse"
        >
          <AlertTriangle className="w-8 h-8" />
          <span className="text-2xl font-bold">تنبيه طوارئ</span>
        </button>
      </div>

      {/* Additional Controls */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Call Specific Patient */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">نداء عميل معين</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="رقم العميل"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors">
              نداء
            </button>
          </div>
        </div>

        {/* Transfer Patient */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">تحويل عميل</h3>
          <div className="flex gap-2">
            <select className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>-- اختر عيادة --</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clinic_name}
                </option>
              ))}
            </select>
            <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors">
              تحويل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

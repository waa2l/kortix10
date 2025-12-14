'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, AlertTriangle, Volume2 } from 'lucide-react';

export default function CallsSettings() {
  const [callSettings, setCallSettings] = useState({
    patient_number: '',
    clinic_id: '',
    emergency_clinic: '',
    alert_text: '',
    audio_file: '',
    record_duration: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const numValue = type === 'number' ? parseInt(value) : value;
    setCallSettings((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handleCallPatient = () => {
    alert(`نداء العميل رقم ${callSettings.patient_number}`);
  };

  const handleEmergency = () => {
    alert('تنبيه طوارئ!');
  };

  const handleAlert = () => {
    alert(`تنبيه: ${callSettings.alert_text}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إعدادات النداء</h1>
            <p className="text-gray-600 mt-1">التحكم في النداءات والتنبيهات</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Patient */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Phone className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">نداء عميل معين</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رقم العميل</label>
                <input
                  type="number"
                  name="patient_number"
                  value={callSettings.patient_number}
                  onChange={handleChange}
                  placeholder="أدخل رقم العميل"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">العيادة</label>
                <select
                  name="clinic_id"
                  value={callSettings.clinic_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- اختر عيادة --</option>
                  <option value="1">طب الأسرة</option>
                  <option value="2">الأطفال</option>
                  <option value="3">النساء والتوليد</option>
                </select>
              </div>

              <button
                onClick={handleCallPatient}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                نداء
              </button>
            </div>
          </div>

          {/* Emergency Alert */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-800">تنبيه طوارئ</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">العيادة</label>
                <select
                  name="emergency_clinic"
                  value={callSettings.emergency_clinic}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- اختر عيادة --</option>
                  <option value="all">جميع العيادات</option>
                  <option value="1">طب الأسرة</option>
                  <option value="2">الأطفال</option>
                </select>
              </div>

              <p className="text-gray-600 text-sm">سيتم تشغيل صوت الطوارئ وعرض تنبيه أحمر على الشاشات</p>

              <button
                onClick={handleEmergency}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 animate-pulse"
              >
                <AlertTriangle className="w-5 h-5" />
                تنبيه طوارئ
              </button>
            </div>
          </div>

          {/* Text Alert */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">تنبيه نصي</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نص التنبيه</label>
                <textarea
                  name="alert_text"
                  value={callSettings.alert_text}
                  onChange={handleChange}
                  placeholder="أدخل نص التنبيه"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleAlert}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                إرسال التنبيه
              </button>
            </div>
          </div>

          {/* Audio Broadcast */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">بث صوتي</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اختر ملف صوتي</label>
                <select
                  name="audio_file"
                  value={callSettings.audio_file}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- اختر ملف --</option>
                  <option value="instant1">أهلا وسهلا بكم</option>
                  <option value="instant2">شكراً لانتظاركم</option>
                  <option value="instant3">يرجى الانتظار</option>
                </select>
              </div>

              <button
                onClick={() => alert('تشغيل الملف الصوتي')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                تشغيل
              </button>
            </div>
          </div>
        </div>

        {/* Daily Reset */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">تصفير يومي</h2>
          <p className="text-gray-600 mb-4">سيتم تصفير جميع العيادات تلقائياً في الساعة 6 صباحاً</p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            تصفير الآن
          </button>
        </div>
      </main>
    </div>
  );
}

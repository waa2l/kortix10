'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSettings } from '@/lib/hooks';
import { ArrowRight, Save, AlertCircle } from 'lucide-react';

export default function GeneralSettings() {
  const router = useRouter();
  const { settings, updateSettings, loading, error: settingsError } = useSettings();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    center_name: '',
    news_ticker_content: '',
    news_ticker_speed: 30,
    alert_duration: 5,
    speech_speed: 1,
  });
  const [loading_submit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setIsClient(true);
    if (settings) {
      setFormData({
        center_name: settings.center_name,
        news_ticker_content: settings.news_ticker_content,
        news_ticker_speed: settings.news_ticker_speed,
        alert_duration: settings.alert_duration,
        speech_speed: settings.speech_speed,
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('speed') || name.includes('duration') ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError('');
    setSuccess('');

    try {
      await updateSettings(formData);
      setSuccess('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في حفظ الإعدادات');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-800">الإعدادات العامة</h1>
            <p className="text-gray-600 mt-1">إدارة إعدادات المركز الطبي</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Error Alert */}
        {(error || settingsError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error || settingsError}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Center Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المركز الطبي</label>
            <input
              type="text"
              name="center_name"
              value={formData.center_name}
              onChange={handleChange}
              placeholder="أدخل اسم المركز"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-gray-500 text-sm mt-1">سيظهر في شاشة العرض والتقارير</p>
          </div>

          {/* News Ticker Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">محتوى الشريط الإخباري</label>
            <textarea
              name="news_ticker_content"
              value={formData.news_ticker_content}
              onChange={handleChange}
              placeholder="أدخل محتوى الشريط الإخباري"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-gray-500 text-sm mt-1">سيتم عرضه في أسفل شاشة العرض</p>
          </div>

          {/* News Ticker Speed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">سرعة الشريط الإخباري (ثانية)</label>
              <input
                type="number"
                name="news_ticker_speed"
                value={formData.news_ticker_speed}
                onChange={handleChange}
                min="10"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-500 text-sm mt-1">الوقت بالثواني لإكمال الشريط</p>
            </div>

            {/* Alert Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">مدة عرض التنبيه (ثانية)</label>
              <input
                type="number"
                name="alert_duration"
                value={formData.alert_duration}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-500 text-sm mt-1">مدة عرض التنبيهات على الشاشة</p>
            </div>
          </div>

          {/* Speech Speed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">سرعة النطق</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="speech_speed"
                value={formData.speech_speed}
                onChange={handleChange}
                min="0.5"
                max="2"
                step="0.1"
                className="flex-1"
              />
              <span className="text-lg font-semibold text-gray-700 w-12">{formData.speech_speed.toFixed(1)}x</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">سرعة النطق الصوتي للنداءات</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading_submit}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading_submit ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
            <Link href="/admin/dashboard">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

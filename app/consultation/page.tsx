'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

export default function ConsultationPage() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <button className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <ArrowRight className="w-5 h-5" />
              العودة
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            <h1 className="text-3xl font-bold">الاستشارات الطبية</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            تسجيل استشارة جديدة
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === 'track'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            تتبع الاستشارة
          </button>
        </div>

        {/* Register Tab */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">تسجيل استشارة جديدة</h2>
            <p className="text-gray-600 mb-4">
              يجب عليك تسجيل حساب أولاً قبل تقديم استشارة. يرجى ملء النموذج بعناية.
            </p>
            <Link href="/consultation/register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                الذهاب إلى نموذج التسجيل
              </button>
            </Link>
          </div>
        )}

        {/* Track Tab */}
        {activeTab === 'track' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">تتبع الاستشارة</h2>
            <p className="text-gray-600 mb-4">
              أدخل الرقم القومي ورقم الاستشارة لتتبع حالة استشارتك.
            </p>
            <Link href="/consultation/track">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                الذهاب إلى صفحة التتبع
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

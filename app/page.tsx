'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
// 1. قمنا بإضافة أيقونة MessageCircle للاستيراد
import { Activity, Users, Monitor, Settings, FileText, Stethoscope, Calendar, MessageSquare, Calculator, Info, MessageCircle } from 'lucide-react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const menuItems = [
    {
      title: 'الصفحة الرئيسية',
      description: 'لوحة التحكم الرئيسية',
      href: '/',
      icon: Activity,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'الإدارة',
      description: 'إدارة المركز والإعدادات',
      href: '/admin/login',
      icon: Settings,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'شاشة العرض',
      description: 'عرض الطوابير والإعلانات',
      href: '/display',
      icon: Monitor,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'لوحة التحكم',
      description: 'التحكم في الطوابير',
      href: '/control',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'الطباعة',
      description: 'طباعة التذاكر',
      href: '/print',
      icon: FileText,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'صفحة العميل',
      description: 'تتبع الطابور والشكاوى',
      href: '/patient',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'حجز موعد',
      description: 'حجز موعد جديد',
      href: '/appointment',
      icon: Calendar,
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'الأطباء',
      description: 'بوابة الأطباء',
      href: '/doctor/login',
      icon: Stethoscope,
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      title: 'الاستشارات',
      description: 'الاستشارات الطبية',
      href: '/consultation',
      icon: MessageSquare,
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'الحاسبات الطبية',
      description: 'أدوات طبية مهمة',
      href: '/calculators',
      icon: Calculator,
      color: 'from-amber-500 to-amber-600',
    },
    // 2. هذا هو الزر الجديد الذي طلبته
    {
      title: 'الشكاوى والمقترحات',
      description: 'نسعد بسماع رأيك',
      href: '/complaints', // تأكد من إنشاء صفحة app/complaints/page.tsx
      icon: MessageCircle,
      color: 'from-rose-500 to-rose-600',
    },
    {
      title: 'عن البرنامج',
      description: 'معلومات عن النظام',
      href: '/about',
      icon: Info,
      color: 'from-slate-500 to-slate-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-2">مركز طب أسرة غرب المطار</h1>
          <p className="text-center text-blue-100">نظام الانتظار الذكى</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer group">
                  <div className={`bg-gradient-to-r ${item.color} h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 نظام إدارة الطوابير الطبية الذكي - اعداد د/ وائل عبد اللطيف ربيع - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}

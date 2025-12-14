'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Zap, Shield, Users } from 'lucide-react';

export default function About() {
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
          <h1 className="text-4xl font-bold">عن البرنامج</h1>
          <p className="text-blue-100 mt-2">نظام إدارة الطوابير الطبية الذكي</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* About Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">عن النظام</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            نظام إدارة الطوابير الطبية الذكي هو حل متكامل وحديث لإدارة الطوابير في المراكز الطبية والعيادات. يوفر النظام
            تجربة سلسة وفعالة لكل من المرضى والموظفين والأطباء.
          </p>
          <p className="text-gray-700 leading-relaxed">
            تم تطوير النظام باستخدام أحدث التقنيات والمعايير العالمية لضمان الأداء العالي والأمان والموثوقية.
          </p>
        </section>

        {/* Features Grid */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">المميزات الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'سرعة عالية',
                description: 'أداء سريع وفعال مع تحديثات فورية',
              },
              {
                icon: Shield,
                title: 'أمان عالي',
                description: 'حماية كاملة للبيانات والمعلومات',
              },
              {
                icon: Users,
                title: 'سهل الاستخدام',
                description: 'واجهة بديهية وسهلة الاستخدام',
              },
              {
                icon: Heart,
                title: 'دعم عربي كامل',
                description: 'دعم كامل للغة العربية والنطق الصوتي',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                  <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Version Info */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">معلومات الإصدار</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">الإصدار الحالي</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الإصدار:</span>
                  <span className="font-bold text-gray-800">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الإصدار:</span>
                  <span className="font-bold text-gray-800">ديسمبر 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <span className="font-bold text-green-600">مستقر</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">المتطلبات</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Node.js 18+</li>
                <li>✓ متصفح حديث</li>
                <li>✓ اتصال إنترنت</li>
                <li>✓ Supabase Account</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">التقنيات المستخدمة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Next.js 14', description: 'إطار العمل الرئيسي' },
              { name: 'React 18', description: 'مكتبة React' },
              { name: 'TypeScript', description: 'لغة البرمجة' },
              { name: 'Tailwind CSS', description: 'تصميم الواجهات' },
              { name: 'Supabase', description: 'قاعدة البيانات' },
              { name: 'Web Audio API', description: 'النطق الصوتي' },
            ].map((tech, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-gray-800">{tech.name}</h4>
                <p className="text-gray-600 text-sm">{tech.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features List */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">الميزات المتقدمة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">إدارة الطوابير</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ إدارة الطوابير الذكية</li>
                <li>✓ تحديثات فورية</li>
                <li>✓ نداءات صوتية</li>
                <li>✓ شاشات عرض متعددة</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">إدارة المرضى</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ حجز المواعيد</li>
                <li>✓ الاستشارات الطبية</li>
                <li>✓ تتبع الحالات</li>
                <li>✓ الشكاوى والاقتراحات</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">إدارة الأطباء</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ إدارة البيانات</li>
                <li>✓ تقارير الحضور</li>
                <li>✓ طلبات الإجازات</li>
                <li>✓ الاستشارات</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">أدوات إضافية</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ حاسبات طبية</li>
                <li>✓ طباعة التذاكر</li>
                <li>✓ التقارير</li>
                <li>✓ الإحصائيات</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">الدعم والمساعدة</h2>
          <p className="mb-6">
            للحصول على الدعم الفني أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق الدعم.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold mb-2">البريد الإلكتروني</h4>
              <p>support@medical-qms.com</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">الهاتف</h4>
              <p>+20 2 XXXX XXXX</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">الموقع</h4>
              <p>www.medical-qms.com</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="text-center py-8">
          <p className="text-gray-600 mb-4">© 2025 نظام إدارة الطوابير الطبية الذكي - جميع الحقوق محفوظة</p>
          <Link href="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              العودة للصفحة الرئيسية
            </button>
          </Link>
        </section>
      </main>
    </div>
  );
}

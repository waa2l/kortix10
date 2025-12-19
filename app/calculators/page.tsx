'use client';

import Link from 'next/link';
import { 
  Scale, Baby, Calendar, ArrowRight, Activity, 
  Heart, Utensils, Brain, Dna
} from 'lucide-react';

export default function CalculatorsMenu() {
  const calculators = [
    {
      title: 'مؤشر كتلة الجسم (BMI)',
      description: 'حساب الوزن المثالي ومعرفة معدل السمنة لديك.',
      href: '/calculators/bmi',
      icon: Scale,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'موعد الولادة المتوقع',
      description: 'حساب تاريخ الولادة وعمر الحمل الحالي وتفاصيل الثلث الحالي.',
      href: '/calculators/pregnancy',
      icon: Baby,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'حاسبة التبويض والخصوبة',
      description: 'تحديد أيام التبويض وأفضل أوقات الخصوبة لحدوث الحمل.',
      href: '/calculators/ovulation',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600',
    },
    // سيتم إضافة باقي الروابط هنا لاحقاً
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-cairo" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowRight className="w-5 h-5 text-slate-600"/>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">الحاسبات الطبية</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc, idx) => {
            const Icon = calc.icon;
            return (
              <Link key={idx} href={calc.href} className="block group">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all h-full">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${calc.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {calc.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {calc.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

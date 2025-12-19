'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Scale, Baby, Calendar, Utensils, Brain, Heart, 
  Activity, Dna, Syringe, TrendingUp, AlertCircle, 
  Smile, Bone, Search, ArrowRight, Stethoscope, 
  Thermometer, FileText
} from 'lucide-react';

export default function CalculatorsMenu() {
  const [searchTerm, setSearchTerm] = useState('');

  // قائمة بجميع الحاسبات الـ 20 التي تم إنشاؤها
  const calculators = [
    // --- عامة وصحة بدنية ---
    {
      title: 'مؤشر كتلة الجسم (BMI)',
      description: 'حساب الوزن المثالي وتقييم حالة السمنة أو النحافة.',
      href: '/calculators/bmi',
      icon: Scale,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'مؤشر استدارة الجسم (BRI)',
      description: 'المقياس الحديث الأدق من BMI لتحديد مخاطر دهون الخصر.',
      href: '/calculators/bri',
      icon: Activity,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      title: 'معدل ضربات القلب المستهدف',
      description: 'نطاقات النبض المثالية لحرق الدهون واللياقة أثناء الرياضة.',
      href: '/calculators/heart-rate',
      icon: Heart,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'القيم الطبيعية للتحاليل',
      description: 'دليل شامل للنسب الطبيعية لأشهر التحاليل الطبية.',
      href: '/calculators/lab-values',
      icon: Dna,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'الفحص الدوري الشامل',
      description: 'تعرف على الفحوصات الطبية المطلوبة حسب سنك وجنسك.',
      href: '/calculators/screening',
      icon: Stethoscope,
      color: 'bg-emerald-50 text-emerald-600',
    },

    // --- نساء وتوليد ---
    {
      title: 'موعد الولادة المتوقع',
      description: 'حساب تاريخ الولادة وعمر الحمل الحالي وتفاصيل الثلث.',
      href: '/calculators/pregnancy',
      icon: Baby,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'حاسبة التبويض والخصوبة',
      description: 'تحديد أيام التبويض وأفضل أوقات الخصوبة للحمل.',
      href: '/calculators/ovulation',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600',
    },

    // --- أطفال ---
    {
      title: 'جرعات أدوية الأطفال',
      description: 'حساب جرعات خافض الحرارة والمضادات حسب الوزن.',
      href: '/calculators/pediatric-dose',
      icon: Thermometer,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'جدول التطعيمات (مصر)',
      description: 'مواعيد التطعيمات الإجبارية للأطفال بوزارة الصحة.',
      href: '/calculators/vaccines',
      icon: Syringe,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'منحنيات النمو (WHO)',
      description: 'مقارنة وزن وطول طفلك بالمعدلات العالمية.',
      href: '/calculators/growth-charts',
      icon: TrendingUp,
      color: 'bg-lime-50 text-lime-600',
    },
    {
      title: 'تطورات الطفل',
      description: 'المهارات الحركية والعقلية المتوقعة حسب عمر الطفل.',
      href: '/calculators/child-development',
      icon: Baby,
      color: 'bg-sky-50 text-sky-600',
    },

    // --- تغذية ---
    {
      title: 'السعرات الحرارية (BMR)',
      description: 'حساب معدل الحرق والسعرات المطلوبة للوزن.',
      href: '/calculators/calories',
      icon: Utensils,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'دليل السعرات المصرية',
      description: 'جدول سعرات لأشهر الأكلات المصرية المحلية.',
      href: '/calculators/food-calories',
      icon: FileText,
      color: 'bg-yellow-50 text-yellow-600',
    },

    // --- صحة نفسية ---
    {
      title: 'مقياس القلق (GAD-7)',
      description: 'اختبار لتقييم حدة أعراض القلق والتوتر.',
      href: '/calculators/gad7',
      icon: Brain,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      title: 'استبيان الاكتئاب (PHQ-9)',
      description: 'أداة لتقييم الصحة النفسية وتشخيص الاكتئاب.',
      href: '/calculators/phq9',
      icon: Smile,
      color: 'bg-fuchsia-50 text-fuchsia-600',
    },
    {
      title: 'مقياس الألم',
      description: 'أداة بصرية لتقييم حدة الألم لتسهيل التشخيص.',
      href: '/calculators/pain-scale',
      icon: AlertCircle,
      color: 'bg-red-50 text-red-600',
    },

    // --- مخاطر وأمراض ---
    {
      title: 'مخاطر القلب (CVD)',
      description: 'تقدير احتمالية الإصابة بأمراض القلب مستقبلاً.',
      href: '/calculators/cvd-risk',
      icon: Heart,
      color: 'bg-rose-50 text-rose-700',
    },
    {
      title: 'مخاطر السكري (FindRisk)',
      description: 'تقييم احتمالية الإصابة بالسكري النوع الثاني.',
      href: '/calculators/diabetes-risk',
      icon: Activity,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'مخاطر هشاشة العظام',
      description: 'فحص سريع لعوامل الخطر لضعف العظام.',
      href: '/calculators/osteoporosis',
      icon: Bone,
      color: 'bg-slate-100 text-slate-600',
    },
  ];

  // تصفية النتائج حسب البحث
  const filteredCalculators = calculators.filter(calc => 
    calc.title.includes(searchTerm) || calc.description.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 font-cairo" dir="rtl">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
              <ArrowRight className="w-6 h-6"/>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">الحاسبات الطبية</h1>
              <p className="text-xs text-slate-500">أدوات طبية ذكية للمساعدة في التشخيص والمتابعة</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
            <input 
              type="text" 
              placeholder="ابحث عن حاسبة (مثال: حمل، سكر، طفل...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition"
            />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto p-6">
        
        {filteredCalculators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCalculators.map((calc, idx) => {
              const Icon = calc.icon;
              return (
                <Link key={idx} href={calc.href} className="group h-full">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${calc.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {calc.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                      {calc.description}
                    </p>

                    <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors mt-auto pt-4 border-t border-slate-50">
                      <span>ابدأ الحساب</span>
                      <ArrowRight className="w-3 h-3 mr-auto group-hover:-translate-x-1 transition-transform"/>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-slate-200 mx-auto mb-4"/>
            <p className="text-slate-500 font-bold">لا توجد حاسبات مطابقة لبحثك</p>
            <button onClick={() => setSearchTerm('')} className="text-blue-600 text-sm mt-2 hover:underline">عرض الكل</button>
          </div>
        )}

      </main>
    </div>
  );
}

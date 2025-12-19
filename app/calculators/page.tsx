'use client';

import Link from 'next/link';
import { 
  Scale, Baby, Calendar, ArrowRight, Utensils, 
  Brain, Smile
} from 'lucide-react';

export default function CalculatorsMenu() {
  const calculators = [
    // --- المجموعة الأولى (تمت) ---
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
    // --- المجموعة الثانية (الجديدة) ---
    {
      title: 'احتياج السعرات اليومي (BMR)',
      description: 'حساب معدل الحرق والسعرات المطلوبة لزيادة أو إنقاص الوزن.',
      href: '/calculators/calories',
      icon: Utensils,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'مقياس القلق العام (GAD-7)',
      description: 'اختبار نفسي سريع لتقييم حدة أعراض القلق والتوتر.',
      href: '/calculators/gad7',
      icon: Brain,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'استبيان صحة المريض (PHQ-9)',
      description: 'أداة طبية لتقييم الصحة النفسية وتشخيص الاكتئاب.',
      href: '/calculators/phq9',
      icon: Smile,
      color: 'bg-indigo-50 text-indigo-600',
    },
    // ... الحاسبات السابقة ...

    // --- المجموعة الثالثة (الجديدة) ---
    {
      title: 'مخاطر أمراض القلب (CVD)',
      description: 'تقدير احتمالية الإصابة بأمراض القلب خلال الـ 10 سنوات القادمة.',
      href: '/calculators/cvd-risk',
      icon: Heart,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'جرعات أدوية الأطفال',
      description: 'حساب جرعات خافض الحرارة والمضادات الحيوية حسب وزن الطفل.',
      href: '/calculators/pediatric-dose',
      icon: Baby, // أو Syringe إذا كانت متاحة
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'مؤشر استدارة الجسم (BRI)',
      description: 'المقياس الحديث الأدق من BMI لتحديد مخاطر الدهون الحشوية.',
      href: '/calculators/bri',
      icon: Activity,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      title: 'معدل ضربات القلب المستهدف',
      description: 'حساب نطاق النبض المثالي أثناء الرياضة لحرق الدهون.',
      href: '/calculators/heart-rate',
      icon: Activity,
      color: 'bg-rose-50 text-rose-600',
    },
    // ... الحاسبات السابقة ...

    // --- المجموعة الرابعة (الجديدة) ---
    {
      title: 'دليل السعرات المصرية',
      description: 'جدول سعرات حرارية لأشهر الأكلات المصرية (كشري، محشي، فول...).',
      href: '/calculators/food-calories',
      icon: Utensils,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'جدول التطعيمات (مصر)',
      description: 'مواعيد التطعيمات الإجبارية للأطفال حسب وزارة الصحة المصرية.',
      href: '/calculators/vaccines',
      icon: Baby, // أو Syringe
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      title: 'قيم التحاليل الطبية',
      description: 'دليل النسب الطبيعية لأشهر التحاليل (صورة الدم، وظائف كلى وكبد).',
      href: '/calculators/lab-values',
      icon: Activity, // أو Dna
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'الفحص الدوري الشامل',
      description: 'تعرف على الفحوصات الطبية المطلوبة حسب سنك وجنسك.',
      href: '/calculators/screening',
      icon: Activity, // أو Stethoscope
      color: 'bg-emerald-50 text-emerald-600',
    },
    // ... الحاسبات السابقة ...

    // --- المجموعة الخامسة (الأخيرة) ---
    {
      title: 'منحنيات النمو (للأطفال)',
      description: 'مقارنة وزن وطول طفلك بالمعدلات العالمية (WHO) لمعرفة حالة النمو.',
      href: '/calculators/growth-charts',
      icon: TrendingUp, // تأكد من استيراد الأيقونة
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'تطورات الطفل (Milestones)',
      description: 'تعرف على المهارات الحركية والعقلية المتوقعة لطفلك حسب عمره.',
      href: '/calculators/child-development',
      icon: Baby,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'مقياس الألم',
      description: 'أداة لتقييم حدة الألم (للكبار والأطفال) لتسهيل التشخيص.',
      href: '/calculators/pain-scale',
      icon: AlertCircle,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'حاسبة مخاطر السكري',
      description: 'اختبار (FINDRISC) لتقييم احتمالية الإصابة بالسكري النوع الثاني.',
      href: '/calculators/diabetes-risk',
      icon: Activity,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      title: 'مخاطر هشاشة العظام',
      description: 'فحص سريع لعوامل الخطر التي قد تؤدي لضعف العظام.',
      href: '/calculators/osteoporosis',
      icon: Bone, // تأكد من استيراد Bone من lucide-react
      color: 'bg-slate-50 text-slate-600',
    },
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

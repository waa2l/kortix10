'use client';

import Link from 'next/link';
import { Syringe, ArrowRight, CheckCircle } from 'lucide-react';

export default function VaccinesPage() {
  const schedule = [
    { age: 'عند الولادة (خلال 24 ساعة)', vac: 'الالتهاب الكبدي (B) - الجرعة الصفرية', type: 'حقن (عضل)' },
    { age: 'عند الولادة (أول أيام)', vac: 'تطعيم شلل الأطفال (سابين)', type: 'نقط بالفم (جرعة صفرية)' },
    { age: 'عند الولادة (حتى 40 يوم)', vac: 'تطعيم الدرن (BCG)', type: 'حقن (في الجلد - كتف أيسر)' },
    
    { age: 'شهرين', vac: 'تطعيم شلل الأطفال (سابين)', type: 'نقط بالفم' },
    { age: 'شهرين', vac: 'التطعيم الخماسي (دفتيريا/تيتانوس/سعال ديكي/كبدي B/انفلونزا بكتيرية) + شلل أطفال (سولك)', type: 'حقن (عضل)' },
    
    { age: '4 شهور', vac: 'تطعيم شلل الأطفال (سابين)', type: 'نقط بالفم' },
    { age: '4 شهور', vac: 'التطعيم الخماسي (دفتيريا/تيتانوس/سعال ديكي/كبدي B/انفلونزا بكتيرية) + شلل أطفال (سولك)', type: 'حقن (عضل)' },

    { age: '6 شهور', vac: 'تطعيم شلل الأطفال (سابين)', type: 'نقط بالفم' },
    { age: '6 شهور', vac: 'التطعيم الخماسي (دفتيريا/تيتانوس/سعال ديكي/كبدي B/انفلونزا بكتيرية) + شلل أطفال (سولك)', type: 'حقن (عضل)' },

    { age: '9 شهور', vac: 'تطعيم شلل الأطفال (سابين)', type: 'نقط بالفم' },

    { age: '12 شهر (سنة)', vac: 'تطعيم شلل الأطفال (سابين)', type: 'نقط بالفم' },
    { age: '12 شهر (سنة)', vac: 'تطعيم MMR (حصبة - حصبة ألماني - نكاف)', type: 'حقن (تحت الجلد - كتف أيمن)' },

    { age: '18 شهر (سنة ونصف)', vac: 'تطعيم شلل الأطفال (سابين)', type: 'نقط بالفم' },
    { age: '18 شهر (سنة ونصف)', vac: 'تطعيم MMR (جرعة ثانية)', type: 'حقن (تحت الجلد - كتف أيمن)' },
    { age: '18 شهر (سنة ونصف)', vac: 'التطعيم الثلاثي (دفتيريا/تيتانوس/سعال ديكي)', type: 'حقن (عضل)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">جدول التطعيمات الإجبارية (مصر)</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {/*  */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-100 left-8 md:left-auto md:right-8"></div>
          
          <div className="space-y-8">
            {schedule.map((item, i) => (
              <div key={i} className="relative flex gap-6 md:gap-8 items-start">
                 <div className="z-10 flex flex-col items-center shrink-0">
                    <div className="w-16 h-16 bg-cyan-500 rounded-full border-4 border-white shadow-md flex items-center justify-center text-center">
                        <span className="text-white text-xs font-bold leading-tight px-1">{item.age.split(' ')[0]}<br/>{item.age.split(' ')[1]}</span>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 hover:border-cyan-200 transition group">
                    <div className="flex items-start gap-3">
                       <CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 shrink-0"/>
                       <div>
                         <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-cyan-700 transition">{item.vac}</h3>
                         <p className="text-xs text-slate-500 mt-1 bg-white inline-block px-2 py-1 rounded border">{item.type}</p>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-slate-400 mt-8 pt-4 border-t">المصدر: وزارة الصحة والسكان المصرية (الجدول المحدث)</p>
        </div>
      </main>
    </div>
  );
}

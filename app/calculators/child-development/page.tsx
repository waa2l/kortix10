'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Baby, ArrowRight, Brain, Smile, Activity } from 'lucide-react';

export default function MilestonesPage() {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  const milestones = [
    {
      id: '2m', label: 'شهرين',
      social: 'يبتسم للناس، يهدأ عند حمله',
      lang: 'يصدر أصوات (هديل)، يلتفت للأصوات',
      motor: 'يرفع رأسه عند الاستلقاء على بطنه، يحرك يديه وقدميه بنعومة'
    },
    {
      id: '6m', label: '6 شهور',
      social: 'يعرف الوجوه المألوفة، يحب اللعب مع الآخرين',
      lang: 'يستجيب للأصوات بإصدار أصوات، ينطق حروف مثل (م، ب)',
      motor: 'يتقلب في الاتجاهين، يبدأ بالجلوس بدون دعم'
    },
    {
      id: '12m', label: 'سنة (12 شهر)',
      social: 'يخاف من الغرباء، يكرر الأصوات للحصول على الانتباه',
      lang: 'يقول "ماما" و "بابا"، يفهم "لا"',
      motor: 'يقف ممسكاً بالأثاث، قد يمشي خطوات قليلة'
    },
    {
      id: '18m', label: 'سنة ونصف',
      social: 'نوبات غضب بسيطة، يلعب "تخيل" بسيط',
      lang: 'يقول عدة كلمات مفردة، يشير للأشياء التي يريدها',
      motor: 'يمشي وحده، يشرب من الكوب، يأكل بالملعقة'
    },
    {
      id: '24m', label: 'سنتين',
      social: 'يقلد الآخرين، يظهر استقلالية أكثر',
      lang: 'يقول جمل من كلمتين إلى 4 كلمات، يعرف أسماء الأشخاص المألوفين',
      motor: 'يركل الكرة، يبدأ بالجري، يصعد السلالم'
    }
  ];

  const current = milestones.find(m => m.id === selectedAge);

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">تطورات الطفل (Milestones)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-center font-bold text-slate-700 mb-6">اختر عمر الطفل</h2>
          
          <div className="grid grid-cols-3 gap-2 mb-8">
            {milestones.map(m => (
              <button 
                key={m.id}
                onClick={() => setSelectedAge(m.id)}
                className={`py-3 rounded-xl text-sm font-bold border transition ${selectedAge === m.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {current ? (
            <div className="space-y-4 animate-in zoom-in-95">
               <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2"><Smile className="w-5 h-5"/> التطور الاجتماعي/العاطفي</h3>
                  <p className="text-sm text-slate-700">{current.social}</p>
               </div>
               <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                  <h3 className="font-bold text-pink-800 mb-2 flex items-center gap-2"><Brain className="w-5 h-5"/> اللغة والتواصل</h3>
                  <p className="text-sm text-slate-700">{current.lang}</p>
               </div>
               <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2"><Activity className="w-5 h-5"/> الحركة والنمو الجسدي</h3>
                  <p className="text-sm text-slate-700">{current.motor}</p>
               </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <Baby className="w-16 h-16 mx-auto mb-4 opacity-20"/>
              <p>اختر عمر الطفل لعرض المهارات المتوقعة</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

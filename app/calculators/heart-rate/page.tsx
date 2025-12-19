'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, TrendingUp } from 'lucide-react';

export default function HeartRatePage() {
  const [age, setAge] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const a = parseInt(age);
    if (!a) return;

    // معادلة فوكس (Fox Formula) البسيطة
    const maxHR = 220 - a;
    
    // المناطق
    const moderateMin = Math.round(maxHR * 0.50);
    const moderateMax = Math.round(maxHR * 0.70);
    const vigorousMin = Math.round(maxHR * 0.70);
    const vigorousMax = Math.round(maxHR * 0.85);

    setResult({ maxHR, moderateMin, moderateMax, vigorousMin, vigorousMax });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">معدل ضربات القلب المستهدف</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-rose-50 p-3 rounded-xl"><Activity className="w-6 h-6 text-rose-600"/></div>
             <div>
               <h2 className="font-bold text-lg">نطاقات التدريب</h2>
               <p className="text-xs text-slate-500">لتحقيق أقصى استفادة من الرياضة (حرق دهون / لياقة)</p>
             </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">عمرك (سنة)</label>
            <input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-rose-500" placeholder="30" />
          </div>

          <button onClick={calculate} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-rose-200">احسب النطاقات</button>

          {result && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              
              <div className="text-center mb-6">
                <p className="text-slate-500 text-sm">أقصى معدل لضربات قلبك (نظرياً)</p>
                <p className="text-4xl font-black text-slate-800">{result.maxHR} <span className="text-lg font-normal text-slate-400">نبضة/دقيقة</span></p>
              </div>

              <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
                 <div className="flex justify-between items-center mb-2">
                   <p className="font-bold text-green-800 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> حرق الدهون (نشاط متوسط)</p>
                   <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">50-70%</span>
                 </div>
                 <p className="text-3xl font-black text-green-600 dir-ltr text-right">{result.moderateMin} - {result.moderateMax}</p>
                 <p className="text-xs text-green-700 mt-1">المشي السريع، السباحة الخفيفة.</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl">
                 <div className="flex justify-between items-center mb-2">
                   <p className="font-bold text-orange-800 flex items-center gap-2"><Activity className="w-5 h-5"/> اللياقة القلبية (نشاط عالي)</p>
                   <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">70-85%</span>
                 </div>
                 <p className="text-3xl font-black text-orange-600 dir-ltr text-right">{result.vigorousMin} - {result.vigorousMax}</p>
                 <p className="text-xs text-orange-700 mt-1">الجري، الكارديو المكثف.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

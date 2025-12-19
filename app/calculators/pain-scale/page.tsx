'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Frown, Meh, Smile } from 'lucide-react';

export default function PainScalePage() {
  const [level, setLevel] = useState<number | null>(null);

  const scales = [
    { val: 0, text: 'لا يوجد ألم', color: 'bg-green-500', icon: Smile },
    { val: 2, text: 'ألم بسيط', color: 'bg-lime-500', icon: Smile },
    { val: 4, text: 'ألم متوسط', color: 'bg-yellow-500', icon: Meh },
    { val: 6, text: 'ألم مزعج', color: 'bg-orange-500', icon: Meh },
    { val: 8, text: 'ألم شديد', color: 'bg-red-500', icon: Frown },
    { val: 10, text: 'ألم لا يطاق', color: 'bg-red-800', icon: Frown },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">مقياس تقييم الألم (Visual Analog Scale)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <h2 className="text-xl font-bold mb-8">كيف تصف حدة الألم الآن؟</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
            {scales.map((s) => {
              const Icon = s.icon;
              return (
                <button 
                  key={s.val}
                  onClick={() => setLevel(s.val)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${level === s.val ? 'border-black scale-110 shadow-xl' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: level === s.val ? 'white' : '' }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm ${s.color}`}>
                     <Icon className="w-8 h-8"/>
                  </div>
                  <span className="font-bold text-sm text-slate-700">{s.val}</span>
                  <span className="text-xs text-slate-500">{s.text}</span>
                </button>
              );
            })}
          </div>

          {level !== null && (
             <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-slate-500 mb-2">التقييم المسجل</p>
                <h3 className="text-3xl font-black text-slate-800 mb-2">{level} / 10</h3>
                <p className={`text-lg font-bold ${level > 6 ? 'text-red-600' : level > 3 ? 'text-orange-600' : 'text-green-600'}`}>
                   {scales.find(s => s.val === level)?.text}
                </p>
                {level >= 6 && <p className="text-sm text-red-500 mt-4 font-bold flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4"/> ينصح بمراجعة الطبيب أو أخذ مسكن فوراً.</p>}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Heart, Sparkles } from 'lucide-react';

export default function OvulationPage() {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    if (!lastPeriod) return;
    
    const lpDate = new Date(lastPeriod);
    const cycle = parseInt(cycleLength);

    // 1. موعد الدورة القادمة
    const nextPeriod = new Date(lpDate);
    nextPeriod.setDate(lpDate.getDate() + cycle);

    // 2. موعد التبويض (عادة قبل 14 يوم من الدورة القادمة)
    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(nextPeriod.getDate() - 14);

    // 3. نافذة الخصوبة (5 أيام قبل التبويض + يوم التبويض)
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 1);

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };

    setResult({
      ovulation: ovulationDate.toLocaleDateString('ar-EG', options),
      fertileStart: fertileStart.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
      fertileEnd: fertileEnd.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
      nextPeriod: nextPeriod.toLocaleDateString('ar-EG', options)
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">حاسبة التبويض والخصوبة</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-purple-50 p-3 rounded-xl"><Sparkles className="w-6 h-6 text-purple-600"/></div>
            <div>
              <h2 className="text-lg font-bold">تتبع أيام الخصوبة</h2>
              <p className="text-xs text-slate-500">لزيادة فرص الحمل بإذن الله</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">أول يوم في آخر دورة</label>
              <input type="date" value={lastPeriod} onChange={e=>setLastPeriod(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">طول الدورة (يوم)</label>
              <input type="number" value={cycleLength} onChange={e=>setCycleLength(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-purple-500" placeholder="28" />
            </div>
          </div>

          <button onClick={calculate} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-purple-200">احسب الأيام</button>

          {result && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              
              {/* بطاقة التبويض */}
              <div className="bg-purple-600 text-white p-6 rounded-2xl text-center relative overflow-hidden shadow-xl shadow-purple-200">
                 <div className="relative z-10">
                    <p className="text-purple-200 font-bold mb-2">يوم التبويض المتوقع (ذروة الخصوبة)</p>
                    <p className="text-3xl font-black">{result.ovulation}</p>
                 </div>
                 <Sparkles className="absolute top-0 right-0 text-white/10 w-32 h-32 -mr-8 -mt-8"/>
              </div>

              {/* نافذة الخصوبة */}
              <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex items-center justify-between">
                <div>
                   <p className="text-green-800 font-bold mb-1 flex items-center gap-2"><Heart className="w-4 h-4 fill-green-600"/> نافذة الخصوبة العالية</p>
                   <p className="text-xs text-green-600">أفضل وقت للجماع لحدوث حمل</p>
                </div>
                <div className="text-left">
                   <p className="text-lg font-black text-green-700 dir-ltr">{result.fertileStart} - {result.fertileEnd}</p>
                </div>
              </div>

              {/* الدورة القادمة */}
              <div className="bg-slate-50 p-4 rounded-xl border text-center text-sm text-slate-500">
                الدورة الشهرية القادمة متوقعة يوم: <span className="font-bold text-slate-800">{result.nextPeriod}</span>
              </div>
            </div>
          )}
        </div>

        {/* شرح إضافي */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
           <h3 className="font-bold mb-4 text-slate-800">كيف تعمل هذه الحاسبة؟</h3>
           <ul className="space-y-3 text-sm text-slate-600 list-disc list-inside leading-relaxed">
             <li>تحدث الإباضة عادة قبل 14 يوماً من بدء الدورة الشهرية التالية.</li>
             <li>تكونين أكثر خصوبة في الأيام الخمسة التي تسبق الإباضة ويوم الإباضة نفسه.</li>
             <li>الحيوانات المنوية يمكنها العيش داخل الجسم لمدة تصل لـ 5 أيام، بينما البويضة تعيش 24 ساعة فقط.</li>
           </ul>
        </div>
      </main>
    </div>
  );
}

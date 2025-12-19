'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Baby, ArrowRight, Calendar, Heart } from 'lucide-react';

export default function PregnancyPage() {
  const [lmp, setLmp] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    if (!lmp) return;
    
    const lmpDate = new Date(lmp);
    const cycleAdjustment = parseInt(cycleLength) - 28;
    
    // معادلة نايجل المعدلة (Naegele's rule)
    // 280 يوم + فرق الدورة الشهرية
    const dueDate = new Date(lmpDate);
    dueDate.setDate(lmpDate.getDate() + 280 + cycleAdjustment);

    // حساب عمر الحمل الحالي
    const today = new Date();
    const diffTime = today.getTime() - lmpDate.getTime();
    
    // إذا كان التاريخ في المستقبل
    if (diffTime < 0) {
      alert('تاريخ آخر دورة يجب أن يكون في الماضي');
      return;
    }

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    // تحديد الثلث (Trimester)
    let trimester = '';
    let trimesterColor = '';
    if (weeks < 13) { trimester = 'الثلث الأول'; trimesterColor = 'bg-blue-100 text-blue-700'; }
    else if (weeks < 27) { trimester = 'الثلث الثاني'; trimesterColor = 'bg-green-100 text-green-700'; }
    else { trimester = 'الثلث الثالث'; trimesterColor = 'bg-pink-100 text-pink-700'; }

    // نسبة التقدم (بحد أقصى 100%)
    const progress = Math.min(100, Math.max(0, (diffDays / 280) * 100));

    setResult({
      dueDate: dueDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      age: `${weeks} أسبوع و ${days} يوم`,
      remainingDays: 280 - diffDays,
      trimester,
      trimesterColor,
      progress
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">حاسبة موعد الولادة</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-pink-50 p-3 rounded-xl"><Baby className="w-6 h-6 text-pink-600"/></div>
            <div>
              <h2 className="text-lg font-bold">بيانات الحمل</h2>
              <p className="text-xs text-slate-500">حساب دقيق بناءً على آخر دورة شهرية</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ أول يوم في آخر دورة شهرية</label>
              <input type="date" value={lmp} onChange={e=>setLmp(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-pink-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">متوسط طول الدورة الشهرية (يوم)</label>
              <input type="number" value={cycleLength} onChange={e=>setCycleLength(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-pink-500" placeholder="28" />
              <p className="text-xs text-slate-400 mt-1">المتوسط الطبيعي هو 28 يوماً</p>
            </div>
          </div>

          <button onClick={calculate} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-pink-200">عرض موعد الولادة</button>

          {result && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100 text-center mb-4 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sm text-pink-800 font-bold mb-2">موعد الولادة المتوقع بإذن الله</p>
                    <p className="text-2xl md:text-3xl font-black text-pink-700 leading-relaxed">{result.dueDate}</p>
                </div>
                <Baby className="absolute -bottom-4 -left-4 w-32 h-32 text-pink-200/50 rotate-12"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
                   <p className="text-xs text-slate-500 mb-1">عمر الحمل الحالي</p>
                   <p className="text-xl font-bold text-slate-800">{result.age}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
                   <p className="text-xs text-slate-500 mb-1">المرحلة الحالية</p>
                   <span className={`text-xs px-2 py-1 rounded font-bold ${result.trimesterColor}`}>{result.trimester}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>البداية</span>
                    <span>الولادة ({result.remainingDays} يوم متبقي)</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-300 to-pink-500 transition-all duration-1000" style={{width: `${result.progress}%`}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

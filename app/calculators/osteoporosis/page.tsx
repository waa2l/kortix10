'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bone, ArrowRight, AlertTriangle } from 'lucide-react'; // تأكد أن Bone موجودة أو استخدم Activity

export default function OsteoporosisPage() {
  const [checks, setChecks] = useState<number[]>([]);

  const factors = [
    { id: 1, text: 'هل سبق أن تعرض أحد والديك لكسر في الفخذ؟' },
    { id: 2, text: 'هل تعرضت لكسر بعد سقوط بسيط؟' },
    { id: 3, text: 'هل تتناول الكورتيزون لأكثر من 3 شهور؟' },
    { id: 4, text: 'هل تدخن حالياً؟' },
    { id: 5, text: 'هل تعاني من التهاب المفاصل الروماتويدي؟' },
    { id: 6, text: 'هل تتناول الكحوليات بانتظام؟' },
    { id: 7, text: '(للنساء) هل انقطع الطمث قبل سن 45؟' },
    { id: 8, text: '(للرجال) هل تعاني من نقص التستوستيرون؟' },
  ];

  const toggle = (id: number) => {
    if (checks.includes(id)) setChecks(checks.filter(c => c !== id));
    else setChecks([...checks, id]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">فحص مخاطر هشاشة العظام (IOF One Minute Test)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-600 mb-6 font-medium">أجب بـ "نعم" على الأسئلة التي تنطبق عليك:</p>
          
          <div className="space-y-3 mb-8">
            {factors.map(f => (
              <label key={f.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${checks.includes(f.id) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <input type="checkbox" checked={checks.includes(f.id)} onChange={() => toggle(f.id)} className="w-5 h-5 accent-blue-500" />
                <span className="font-bold text-sm">{f.text}</span>
              </label>
            ))}
          </div>

          <div className="bg-slate-100 p-6 rounded-xl text-center">
             <p className="text-sm text-slate-500 mb-2">النتيجة</p>
             {checks.length === 0 ? (
               <p className="text-green-600 font-bold text-lg">لا توجد عوامل خطر واضحة حالياً.</p>
             ) : (
               <div>
                  <p className="text-red-600 font-bold text-lg mb-2 flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5"/> لديك {checks.length} عوامل خطر!</p>
                  <p className="text-slate-600 text-sm">وجود عامل واحد أو أكثر لا يعني أنك مصاب بالهشاشة، ولكنه يعني ضرورة استشارة الطبيب لإجراء فحص كثافة العظام (DEXA).</p>
               </div>
             )}
          </div>
          
          <p className="text-xs text-center text-slate-400 mt-4">المصدر: المؤسسة الدولية لهشاشة العظام (IOF)</p>
        </div>
      </main>
    </div>
  );
}

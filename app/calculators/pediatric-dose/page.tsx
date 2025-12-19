'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Syringe, ArrowRight, AlertOctagon, Info } from 'lucide-react';

export default function PediatricDosePage() {
  const [weight, setWeight] = useState('');
  const [drugType, setDrugType] = useState('paracetamol');
  
  const calculateDose = () => {
    const w = parseFloat(weight);
    if (!w) return null;

    if (drugType === 'paracetamol') {
      // 10-15 mg/kg every 4-6 hours
      const min = Math.round(w * 10);
      const max = Math.round(w * 15);
      return {
        name: 'باراسيتامول (سيتال / بانادول)',
        min, max,
        freq: 'كل 4 إلى 6 ساعات',
        maxDaily: 'لا تزيد عن 5 جرعات يومياً',
        syrupInfo: `لو الدواء تركيزه (120مجم/5مل) -> الجرعة: ${(min/24).toFixed(1)} مل إلى ${(max/24).toFixed(1)} مل`
      };
    }
    if (drugType === 'ibuprofen') {
      // 5-10 mg/kg every 6-8 hours
      const min = Math.round(w * 5);
      const max = Math.round(w * 10);
      return {
        name: 'إيبوبروفين (بروفين / كونتافيفر)',
        min, max,
        freq: 'كل 6 إلى 8 ساعات',
        maxDaily: 'لا يستخدم تحت سن 6 شهور',
        syrupInfo: `لو الدواء تركيزه (100مجم/5مل) -> الجرعة: ${(min/20).toFixed(1)} مل إلى ${(max/20).toFixed(1)} مل`
      };
    }
    if (drugType === 'amoxicillin') {
      // 25-50 mg/kg divided every 12h or 8h
      const minDaily = Math.round(w * 25);
      const maxDaily = Math.round(w * 50);
      return {
        name: 'أموكسيسيلين (مضاد حيوي)',
        min: minDaily, max: maxDaily,
        freq: 'تقسم الجرعة اليومية المكتوبة أدناه على 2 أو 3 مرات',
        maxDaily: 'الجرعة المحسوبة هي "لليوم الكامل"',
        syrupInfo: `لو الدواء تركيزه (250مجم/5مل) -> إجمالي اليوم: ${(minDaily/50).toFixed(1)} مل إلى ${(maxDaily/50).toFixed(1)} مل`
      };
    }
  };

  const result = calculateDose();

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">حاسبة جرعات الأطفال</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6 flex gap-3">
             <AlertOctagon className="w-8 h-8 text-orange-600 shrink-0"/>
             <p className="text-xs text-orange-800 font-bold leading-relaxed">
               تنبيه هام: هذه الحاسبة استرشادية فقط. يجب دائماً مراجعة الطبيب أو الصيدلي قبل إعطاء الدواء، والتأكد من "تركيز الدواء" المكتوب على العلبة لأن التركيزات تختلف.
             </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">وزن الطفل (كجم)</label>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-orange-500" placeholder="مثال: 10" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">المادة الفعالة</label>
              <select value={drugType} onChange={e=>setDrugType(e.target.value)} className="w-full p-3 border rounded-xl outline-none bg-white focus:border-orange-500">
                <option value="paracetamol">باراسيتامول (خافض حرارة آمن)</option>
                <option value="ibuprofen">إيبوبروفين (خافض حرارة ومسكن)</option>
                <option value="amoxicillin">أموكسيسيلين (مضاد حيوي شائع)</option>
              </select>
            </div>
          </div>

          {result && weight && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 space-y-4">
              <div className="bg-blue-600 text-white p-6 rounded-2xl text-center shadow-lg shadow-blue-200">
                <p className="text-blue-100 text-sm mb-1">الجرعة الفعالة (بالمجم)</p>
                <p className="text-3xl font-black">{result.min} - {result.max} مجم</p>
                <p className="text-sm font-bold mt-1 opacity-90">{result.freq}</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-blue-500"/> مثال تطبيقي (للأدوية الشراب):
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{result.syrupInfo}</p>
                <p className="text-xs text-red-500 font-bold border-t pt-2 border-slate-200">
                  * {result.maxDaily}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

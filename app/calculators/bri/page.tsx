'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Info } from 'lucide-react';

export default function BRIPage() {
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const h = parseFloat(height) / 100; // to meters
    const w = parseFloat(waist) / 100; // to meters
    
    if (!h || !w) return;

    // Formula: 364.2 - 365.5 * sqrt(1 - ( (wc / 2π)^2 / (0.5 * height)^2 ) )
    try {
      const numerator = Math.pow(w / (2 * Math.PI), 2);
      const denominator = Math.pow(0.5 * h, 2);
      const term = 1 - (numerator / denominator);
      
      if (term < 0) {
        alert("الأرقام المدخلة غير منطقية (محيط الخصر كبير جداً بالنسبة للطول)");
        return;
      }

      const bri = 364.2 - (365.5 * Math.sqrt(term));
      
      // التفسير (Based on recent studies approx values)
      let status = '';
      let color = '';
      if (bri < 3) { status = 'شكل جسم نحيف/رياضي'; color = 'text-green-600'; }
      else if (bri < 5) { status = 'معدل صحي متوسط'; color = 'text-blue-600'; }
      else if (bri < 7) { status = 'مؤشر مرتفع (دهون وسطية)'; color = 'text-orange-600'; }
      else { status = 'مؤشر خطر (سمنة مركزية)'; color = 'text-red-600'; }

      setResult({ val: bri.toFixed(2), status, color });
    } catch (e) {
      alert("حدث خطأ في الحساب، تأكد من الأرقام");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">مؤشر استدارة الجسم (BRI)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 mb-6 text-sm text-cyan-800 leading-relaxed">
            مؤشر (Body Roundness Index) هو مقياس حديث يعتبر أدق من الـ BMI في توقع مخاطر القلب والسكري، لأنه يركز على "الدهون الحشوية" المتراكمة حول الخصر.
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الطول (سم)</label>
              <input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-cyan-500" placeholder="170" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">محيط الخصر (سم)</label>
              <input type="number" value={waist} onChange={e=>setWaist(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-cyan-500" placeholder="80" />
              <p className="text-[10px] text-slate-400 mt-1">يُقاس عند مستوى السرة تقريباً</p>
            </div>
          </div>

          <button onClick={calculate} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-200">احسب المؤشر</button>

          {result && (
            <div className="mt-8 text-center animate-in fade-in zoom-in-95">
               <p className="text-slate-500 mb-1">نتيجة مؤشر BRI</p>
               <p className="text-5xl font-black text-slate-800 mb-2">{result.val}</p>
               <p className={`text-lg font-bold ${result.color} bg-slate-50 inline-block px-4 py-1 rounded-lg`}>{result.status}</p>
               
               <div className="mt-6 text-right bg-slate-50 p-4 rounded-xl text-sm text-slate-600">
                 <p className="font-bold mb-2">ماذا يعني الرقم؟</p>
                 <ul className="list-disc list-inside space-y-1">
                   <li>كلما اقترب الرقم من 1، كان الجسم أكثر "نحافة".</li>
                   <li>كلما زاد الرقم، زادت "استدارة" الجسم (تراكم الدهون في البطن)، مما يزيد المخاطر الصحية.</li>
                 </ul>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

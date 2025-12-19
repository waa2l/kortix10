'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Baby, AlertTriangle } from 'lucide-react';

export default function GrowthChartsPage() {
  const [gender, setGender] = useState('boy');
  const [age, setAge] = useState(''); // بالشهور
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [result, setResult] = useState<any>(null);

  // بيانات استرشادية مبسطة (WHO Standards - 50th Percentile approx)
  // هذه مصفوفة تقريبية للأغراض التوضيحية
  const standards: any = {
    boy: {
      0: { w: 3.3, l: 49.9 }, 3: { w: 6.4, l: 61.4 }, 6: { w: 7.9, l: 67.6 },
      9: { w: 8.9, l: 72.0 }, 12: { w: 9.6, l: 75.7 }, 18: { w: 10.9, l: 82.3 },
      24: { w: 12.2, l: 87.8 }, 36: { w: 14.3, l: 96.1 }, 48: { w: 16.3, l: 103.3 }, 60: { w: 18.3, l: 110.0 }
    },
    girl: {
      0: { w: 3.2, l: 49.1 }, 3: { w: 5.8, l: 59.8 }, 6: { w: 7.3, l: 65.7 },
      9: { w: 8.2, l: 70.1 }, 12: { w: 8.9, l: 74.0 }, 18: { w: 10.2, l: 80.7 },
      24: { w: 11.5, l: 86.4 }, 36: { w: 13.9, l: 95.1 }, 48: { w: 16.1, l: 102.7 }, 60: { w: 18.2, l: 109.4 }
    }
  };

  const calculate = () => {
    const a = parseInt(age);
    const w = parseFloat(weight);
    
    // نجد أقرب عمر في الجدول
    const ages = Object.keys(standards[gender]).map(Number);
    const closestAge = ages.reduce((prev, curr) => Math.abs(curr - a) < Math.abs(prev - a) ? curr : prev);
    
    const std = standards[gender][closestAge];
    
    // حساب الانحراف
    const weightDiff = ((w - std.w) / std.w) * 100;
    
    let wStatus = '';
    let wColor = '';
    
    if (weightDiff < -15) { wStatus = 'أقل من المعدل (نحافة)'; wColor = 'text-blue-600'; }
    else if (weightDiff > 15) { wStatus = 'أعلى من المعدل (وزن زائد)'; wColor = 'text-red-600'; }
    else { wStatus = 'وزن مثالي (حول المعدل الطبيعي)'; wColor = 'text-green-600'; }

    setResult({
      stdWeight: std.w,
      stdLength: std.l,
      wStatus, wColor,
      closestAge
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">منحنيات النمو (WHO)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
             <button onClick={()=>setGender('boy')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender==='boy' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>ولد</button>
             <button onClick={()=>setGender('girl')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender==='girl' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>بنت</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold mb-1">عمر الطفل (بالشهور)</label>
              <input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="مثال: 12" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الوزن الحالي (كجم)</label>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="مثال: 9.5" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الطول الحالي (سم) - اختياري</label>
              <input type="number" value={length} onChange={e=>setLength(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="مثال: 75" />
            </div>
          </div>

          <button onClick={calculate} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-orange-200">تحليل النمو</button>

          {result && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 space-y-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center">
                 <p className="text-slate-500 text-sm mb-2">مقارنة بالمعدل العالمي لعمر {result.closestAge} شهر</p>
                 <h3 className={`text-2xl font-black ${result.wColor}`}>{result.wStatus}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white border p-4 rounded-xl">
                  <p className="text-xs text-slate-400">الوزن المثالي لهذا العمر</p>
                  <p className="text-xl font-bold text-slate-800">{result.stdWeight} كجم</p>
                </div>
                <div className="bg-white border p-4 rounded-xl">
                  <p className="text-xs text-slate-400">الطول المثالي لهذا العمر</p>
                  <p className="text-xl font-bold text-slate-800">{result.stdLength} سم</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start bg-yellow-50 p-3 rounded-lg text-yellow-800 text-xs mt-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
                <p>ملاحظة: الأطفال ينمون بسرعات مختلفة. طالما طفلك يتبع منحنى نمو ثابت (حتى لو كان أقل قليلاً)، فهذا غالباً طبيعي. استشر طبيبك إذا كان هناك تغير مفاجئ.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

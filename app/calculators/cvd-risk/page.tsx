'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CVDRiskPage() {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [hdl, setHdl] = useState('');
  const [systolic, setSystolic] = useState('');
  const [smoker, setSmoker] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [treated, setTreated] = useState(false); // هل يتعالج من الضغط؟
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    // هذه معادلة تبسيطية لـ Framingham Risk Score (لأغراض توضيحية)
    // المعادلة الأصلية معقدة جداً وتتطلب لوغاريتمات دقيقة
    // سنستخدم منطق النقاط التقريبي (Point System)

    let points = 0;
    const a = parseInt(age);
    const chol = parseInt(cholesterol);
    const h = parseInt(hdl);
    const sys = parseInt(systolic);

    if (!a || !chol || !h || !sys) return;

    // 1. Age Points
    if (gender === 'male') {
       if (a <= 34) points -= 9;
       else if (a <= 39) points -= 4;
       else if (a <= 44) points += 0;
       else if (a <= 49) points += 3;
       else if (a <= 54) points += 6;
       else if (a <= 59) points += 8;
       else points += 10;
    } else {
       if (a <= 34) points -= 7;
       else if (a <= 39) points -= 3;
       else if (a <= 44) points += 0;
       else if (a <= 49) points += 3;
       else if (a <= 54) points += 6;
       else points += 8;
    }

    // 2. Cholesterol
    if (gender === 'male') {
        if (chol < 160) points += 0;
        else if (chol < 200) points += 4;
        else if (chol < 240) points += 7;
        else points += 9;
    } else {
        if (chol < 160) points += 0;
        else if (chol < 200) points += 4;
        else if (chol < 240) points += 8;
        else points += 11;
    }

    // 3. Smoking
    if (smoker) points += (gender === 'male' ? 8 : 9);

    // 4. HDL (Good Cholesterol)
    if (h >= 60) points -= 1;
    else if (h < 40) points += 2;
    else points += 1;

    // 5. Systolic BP
    if (sys < 120) points += 0;
    else if (sys < 130) points += (treated ? 1 : 0);
    else if (sys < 140) points += (treated ? 2 : 1);
    else points += (treated ? 3 : 2);

    // Calculate Risk % based on points (Simplified Lookup)
    let risk = 1;
    if (points <= 0) risk = 1;
    else if (points <= 4) risk = 1;
    else if (points <= 6) risk = 2;
    else if (points <= 8) risk = 3;
    else if (points <= 10) risk = 6;
    else if (points <= 12) risk = 10;
    else if (points <= 14) risk = 16;
    else if (points <= 16) risk = 25;
    else risk = 30; // Max cap for simplified version

    // Diabetes doubles the risk roughly
    if (diabetes) risk = Math.min(risk * 1.5, 99);

    setResult({ score: risk, points });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">حاسبة مخاطر القلب (Framingham Score)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-red-50 p-3 rounded-xl"><Heart className="w-6 h-6 text-red-600"/></div>
            <div>
              <h2 className="text-lg font-bold">العوامل المؤثرة</h2>
              <p className="text-xs text-slate-500">تقدير نسبة الخطر خلال 10 سنوات</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             {/* Gender */}
             <div className="flex bg-slate-100 p-1 rounded-xl col-span-2">
               <button onClick={()=>setGender('male')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender==='male' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>ذكر</button>
               <button onClick={()=>setGender('female')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender==='female' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>أنثى</button>
             </div>

             <div><label className="text-sm font-bold block mb-1">العمر</label><input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="سنة"/></div>
             <div><label className="text-sm font-bold block mb-1">الضغط الانقباضي (العالي)</label><input type="number" value={systolic} onChange={e=>setSystolic(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="مثال: 120"/></div>
             <div><label className="text-sm font-bold block mb-1">الكوليسترول الكلي</label><input type="number" value={cholesterol} onChange={e=>setCholesterol(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="mg/dL"/></div>
             <div><label className="text-sm font-bold block mb-1">كوليسترول HDL (الجيد)</label><input type="number" value={hdl} onChange={e=>setHdl(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="mg/dL"/></div>

             <div className="col-span-2 space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-slate-50">
                  <input type="checkbox" checked={smoker} onChange={e=>setSmoker(e.target.checked)} className="w-5 h-5 accent-red-600"/>
                  <span className="font-bold text-sm">مدخن؟</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-slate-50">
                  <input type="checkbox" checked={diabetes} onChange={e=>setDiabetes(e.target.checked)} className="w-5 h-5 accent-red-600"/>
                  <span className="font-bold text-sm">مريض سكري؟</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-slate-50">
                  <input type="checkbox" checked={treated} onChange={e=>setTreated(e.target.checked)} className="w-5 h-5 accent-red-600"/>
                  <span className="font-bold text-sm">تتعالج من الضغط؟</span>
                </label>
             </div>
          </div>

          <button onClick={calculate} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-200">احسب الخطر</button>

          {result && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4">
               <p className="text-slate-500 mb-2">احتمالية الإصابة بأزمة قلبية خلال 10 سنوات</p>
               <div className={`text-5xl font-black mb-4 ${result.score > 10 ? 'text-red-600' : result.score > 5 ? 'text-orange-500' : 'text-green-600'}`}>
                 {result.score}%
               </div>
               
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-right text-sm leading-relaxed">
                 <p className="font-bold mb-2">التفسير:</p>
                 <ul className="list-disc list-inside space-y-1 text-slate-700">
                   <li><strong>أقل من 10%:</strong> خطر منخفض (Low Risk).</li>
                   <li><strong>10% - 20%:</strong> خطر متوسط (Intermediate Risk).</li>
                   <li><strong>أكثر من 20%:</strong> خطر مرتفع (High Risk).</li>
                 </ul>
                 <p className="mt-3 text-xs text-red-500 font-bold flex gap-1 items-center">
                    <AlertTriangle className="w-4 h-4"/> تنبيه: هذه النتيجة استرشادية فقط ولا تغني عن التشخيص الطبي الدقيق.
                 </p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

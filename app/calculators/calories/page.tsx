'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Utensils, ArrowRight, Activity, Flame } from 'lucide-react';

export default function CaloriesPage() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('1.2');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    if (!w || !h || !a) return;

    // معادلة Mifflin-St Jeor
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    if (gender === 'male') bmr += 5;
    else bmr -= 161;

    const tdee = bmr * parseFloat(activity);

    setResult({
      bmr: Math.round(bmr),
      maintain: Math.round(tdee),
      lose: Math.round(tdee - 500),
      gain: Math.round(tdee + 500)
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">حاسبة السعرات الحرارية (BMR & TDEE)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-xl"><Flame className="w-6 h-6 text-green-600"/></div>
            <div>
              <h2 className="text-lg font-bold">بيانات الجسم والنشاط</h2>
              <p className="text-xs text-slate-500">لحساب معدل الحرق اليومي بدقة</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
             {/* الجنس */}
             <div className="col-span-2 flex bg-slate-100 p-1 rounded-xl">
               <button onClick={()=>setGender('male')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender==='male' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>ذكر</button>
               <button onClick={()=>setGender('female')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender==='female' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>أنثى</button>
             </div>

             <div><label className="text-sm font-bold block mb-1">السن</label><input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="30"/></div>
             <div><label className="text-sm font-bold block mb-1">الوزن (كجم)</label><input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="75"/></div>
             <div><label className="text-sm font-bold block mb-1">الطول (سم)</label><input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="175"/></div>
             
             <div className="col-span-2">
               <label className="text-sm font-bold block mb-1">مستوى النشاط</label>
               <select value={activity} onChange={e=>setActivity(e.target.value)} className="w-full p-3 border rounded-xl bg-white">
                 <option value="1.2">خامل (لا رياضة / عمل مكتبي)</option>
                 <option value="1.375">خفيف (رياضة 1-3 أيام)</option>
                 <option value="1.55">متوسط (رياضة 3-5 أيام)</option>
                 <option value="1.725">نشيط (رياضة 6-7 أيام)</option>
                 <option value="1.9">نشيط جداً (عمل شاق / تمرين مكثف)</option>
               </select>
             </div>
          </div>

          <button onClick={calculate} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-green-200">احسب السعرات</button>

          {result && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-slate-800 text-white p-6 rounded-2xl text-center">
                 <p className="text-slate-300 text-sm mb-1">سعرات الثبات (للحفاظ على الوزن)</p>
                 <p className="text-4xl font-black text-green-400">{result.maintain} <span className="text-lg text-white font-normal">سعرة/يوم</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                    <p className="text-blue-800 font-bold mb-1">لإنقاص الوزن</p>
                    <p className="text-2xl font-black text-blue-600">{result.lose}</p>
                    <p className="text-[10px] text-slate-500">(-0.5 كجم أسبوعياً)</p>
                 </div>
                 <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center">
                    <p className="text-orange-800 font-bold mb-1">لزيادة الوزن</p>
                    <p className="text-2xl font-black text-orange-600">{result.gain}</p>
                    <p className="text-[10px] text-slate-500">(+0.5 كجم أسبوعياً)</p>
                 </div>
              </div>
              
              <div className="text-center text-xs text-slate-400 pt-4 border-t">
                 معدل الحرق الأساسي (BMR) وأنت نائم: {result.bmr} سعرة
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

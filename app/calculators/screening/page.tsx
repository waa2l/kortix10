'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Stethoscope, CheckSquare } from 'lucide-react';

export default function ScreeningPage() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState<string[]>([]);

  const calculate = () => {
    const a = parseInt(age);
    if (!a) return;
    
    const tests = [];

    // General for all adults
    tests.push('قياس ضغط الدم (مرة كل سنتين على الأقل)');
    tests.push('فحص الأسنان (كل 6 شهور)');

    // Lipid & Diabetes
    if (a >= 35 || (a >= 20 && gender==='male')) tests.push('تحليل دهون كامل (Lipid Profile) كل 5 سنوات');
    if (a >= 40) tests.push('تحليل سكر صائم وتراكمي (كل 3 سنوات)');

    // Cancer Screening
    if (a >= 45) tests.push('فحص سرطان القولون (Colonoscopy كل 10 سنوات أو تحليل براز سنوي)');
    
    // Women Specific
    if (gender === 'female') {
      if (a >= 21) tests.push('مسحة عنق الرحم (Pap Smear) كل 3 سنوات');
      if (a >= 40) tests.push('أشعة الماموجرام للثدي (Mammogram) كل سنة أو سنتين');
      if (a >= 65) tests.push('فحص هشاشة العظام (DEXA Scan)');
    }

    // Men Specific
    if (gender === 'male') {
      if (a >= 50) tests.push('فحص البروستاتا (PSA) والنقاش مع الطبيب حوله');
      if (a >= 65) tests.push('فحص تمدد الشريان الأورطي البطني (مرة واحدة للمدخنين)');
    }

    setResult(tests);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">الفحص الدوري الشامل (Screening)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="flex gap-4 mb-6">
             <div className="flex bg-slate-100 p-1 rounded-xl flex-1">
               <button onClick={()=>setGender('male')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender==='male' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>رجل</button>
               <button onClick={()=>setGender('female')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${gender==='female' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>امرأة</button>
             </div>
             <div className="flex-1">
               <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="العمر (سنة)" className="w-full p-3 border rounded-xl text-center font-bold outline-none focus:border-emerald-500"/>
             </div>
          </div>

          <button onClick={calculate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-200">اعرض الفحوصات المقترحة</button>

          {result.length > 0 && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Stethoscope className="w-5 h-5 text-emerald-600"/> الفحوصات الموصى بها لك:</h3>
               <div className="space-y-3">
                 {result.map((test, i) => (
                   <div key={i} className="flex gap-3 items-start p-3 rounded-lg hover:bg-emerald-50 transition border border-transparent hover:border-emerald-100">
                      <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"/>
                      <p className="text-slate-700 text-sm font-medium">{test}</p>
                   </div>
                 ))}
               </div>
               <p className="text-xs text-slate-400 mt-6 text-center">المصدر: توصيات فريق الخدمات الوقائية الأمريكي (USPSTF)</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, CheckCircle } from 'lucide-react';

export default function DiabetesRiskPage() {
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(0); // 0 to 7 questions
  const [finished, setFinished] = useState(false);

  const questions = [
    { q: 'العمر', options: [{t:'أقل من 45', s:0}, {t:'45-54', s:2}, {t:'55-64', s:3}, {t:'أكثر من 64', s:4}] },
    { q: 'مؤشر كتلة الجسم (الوزن)', options: [{t:'أقل من 25 (وزن طبيعي)', s:0}, {t:'25-30 (وزن زائد)', s:1}, {t:'أكثر من 30 (سمنة)', s:3}] },
    { q: 'محيط الخصر (رجال / نساء)', options: [{t:'أقل من 94سم / 80سم', s:0}, {t:'94-102سم / 80-88سم', s:3}, {t:'أكثر من 102سم / 88سم', s:4}] },
    { q: 'هل تمارس الرياضة يومياً (30 دقيقة)؟', options: [{t:'نعم', s:0}, {t:'لا', s:2}] },
    { q: 'هل تتناول الخضروات والفاكهة يومياً؟', options: [{t:'يومياً', s:0}, {t:'ليس كل يوم', s:1}] },
    { q: 'هل سبق أن تناولت دواء للضغط؟', options: [{t:'لا', s:0}, {t:'نعم', s:2}] },
    { q: 'هل وجدت ارتفاعاً في السكر سابقاً (أثناء فحص أو حمل)؟', options: [{t:'لا', s:0}, {t:'نعم', s:5}] },
    { q: 'تاريخ عائلي للسكري (أقارب)؟', options: [{t:'لا', s:0}, {t:'نعم (جد/عم/خال)', s:3}, {t:'نعم (أب/أم/أخ/أخت)', s:5}] },
  ];

  const handleSelect = (s: number) => {
    setScore(prev => prev + s);
    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const getResult = () => {
    if (score < 7) return { risk: 'منخفض جداً', msg: 'أنت في أمان حالياً (1%)', color: 'text-green-600' };
    if (score < 12) return { risk: 'منخفض', msg: 'احتمالية قليلة (4%)', color: 'text-blue-600' };
    if (score < 15) return { risk: 'متوسط', msg: 'يجب الانتباه للوزن والرياضة (17%)', color: 'text-yellow-600' };
    if (score < 21) return { risk: 'مرتفع', msg: 'خطر! يجب استشارة طبيب (33%)', color: 'text-orange-600' };
    return { risk: 'مرتفع جداً', msg: 'احتمالية كبيرة جداً (50%) - افحص فوراً', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">حاسبة مخاطر السكري (FINDRISC)</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 mt-6">
        {!finished ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">سؤال {step + 1} من {questions.length}</p>
            <h2 className="text-xl font-bold text-slate-800 mb-8 h-16">{questions[step].q}</h2>
            <div className="space-y-3">
              {questions[step].options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleSelect(opt.s)}
                  className="w-full py-4 px-6 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-700 font-bold transition text-right flex justify-between group"
                >
                  <span>{opt.t}</span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500"/>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center animate-in zoom-in-95">
             <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Activity className="w-10 h-10 text-sky-600"/>
             </div>
             <p className="text-slate-500 mb-2">نتيجة التقييم</p>
             <h2 className={`text-4xl font-black mb-2 ${getResult().color}`}>{getResult().risk}</h2>
             <p className="text-lg font-medium text-slate-600 mb-8">{getResult().msg}</p>
             <button onClick={() => { setScore(0); setStep(0); setFinished(false); }} className="text-sky-600 font-bold hover:underline">إعادة الاختبار</button>
          </div>
        )}
      </main>
    </div>
  );
}

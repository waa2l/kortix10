'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function GAD7Page() {
  const questions = [
    "الشعور بالعصبية أو القلق أو التوتر",
    "عدم القدرة على وقف القلق أو السيطرة عليه",
    "القلق المفرط بشأن أشياء مختلفة",
    "صعوبة في الاسترخاء",
    "الشعور بعدم الاستقرار لدرجة صعوبة الجلوس",
    "سرعة الانفعال أو حدة الطبع",
    "الشعور بالخوف وكأن شيئاً فظيعاً سيحدث"
  ];

  const [answers, setAnswers] = useState<number[]>(new Array(7).fill(-1));
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    if (answers.includes(-1)) {
      alert('يرجى الإجابة على جميع الأسئلة');
      return;
    }
    setShowResult(true);
  };

  const reset = () => {
    setAnswers(new Array(7).fill(-1));
    setShowResult(false);
  };

  const totalScore = answers.reduce((a, b) => (b === -1 ? a : a + b), 0);

  const getInterpretation = () => {
    if (totalScore <= 4) return { text: "قلق بسيط جداً (الحد الأدنى)", color: "text-green-600", bg: "bg-green-50", advice: "لا توجد أعراض قلق ملحوظة." };
    if (totalScore <= 9) return { text: "قلق خفيف", color: "text-blue-600", bg: "bg-blue-50", advice: "ينصح بمتابعة الأعراض وممارسة تمارين الاسترخاء." };
    if (totalScore <= 14) return { text: "قلق متوسط", color: "text-orange-600", bg: "bg-orange-50", advice: "قد تحتاج لاستشارة مختص نفسي لتقييم الحالة." };
    return { text: "قلق شديد", color: "text-red-600", bg: "bg-red-50", advice: "ينصح بشدة بزيارة طبيب نفسي للتقييم والعلاج." };
  };

  const resultData = getInterpretation();

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">مقياس القلق العام (GAD-7)</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {!showResult ? (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl text-sm text-teal-800 flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0"/>
              <p>على مدار <strong>الأسبوعين الماضيين</strong>، كم مرة عانيت من المشاكل التالية؟</p>
            </div>

            {questions.map((q, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="font-bold text-slate-800 mb-4">{i + 1}. {q}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['أبداً (0)', 'عدة أيام (1)', 'أكثر من نصف الأيام (2)', 'يومياً تقريباً (3)'].map((opt, val) => (
                    <button
                      key={val}
                      onClick={() => handleAnswer(i, val)}
                      className={`py-2 px-3 rounded-lg text-sm border transition ${answers[i] === val ? 'bg-teal-600 text-white border-teal-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-teal-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={calculateScore} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-teal-200">عرض النتيجة</button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center animate-in zoom-in-95">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${resultData.bg}`}>
               <Brain className={`w-10 h-10 ${resultData.color}`}/>
            </div>
            <p className="text-slate-500 mb-2">نتيجتك هي</p>
            <p className="text-5xl font-black text-slate-800 mb-2">{totalScore} <span className="text-lg text-slate-400 font-medium">/ 21</span></p>
            <h2 className={`text-2xl font-bold mb-4 ${resultData.color}`}>{resultData.text}</h2>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <p className="text-slate-700 leading-relaxed">{resultData.advice}</p>
            </div>

            <button onClick={reset} className="flex items-center justify-center gap-2 mx-auto text-slate-500 hover:text-teal-600 font-bold">
              <RefreshCw className="w-4 h-4"/> إعادة الاختبار
            </button>
            
            <p className="text-xs text-slate-400 mt-8 border-t pt-4">المصدر: Spitzer RL, Kroenke K, Williams JB, et al; A Brief Measure for Assessing Generalized Anxiety Disorder. Arch Intern Med. 2006.</p>
          </div>
        )}
      </main>
    </div>
  );
}

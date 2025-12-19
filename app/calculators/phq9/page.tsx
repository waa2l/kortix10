'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Smile, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function PHQ9Page() {
  const questions = [
    "قلة الرغبة أو المتعة في القيام بالأشياء",
    "الشعور باليأس أو الإحباط أو الاكتئاب",
    "صعوبة في النوم أو البقاء نائماً، أو النوم كثيراً",
    "الشعور بالتعب أو قلة الطاقة",
    "ضعف الشهية أو الإفراط في الأكل",
    "الشعور بالسوء تجاه نفسك أو أنك فاشل",
    "صعوبة في التركيز (مثل قراءة الجريدة أو مشاهدة التلفاز)",
    "الحركة أو الكلام ببطء شديد، أو العكس (التململ وكثرة الحركة)",
    "أفكار بأنك ستكون أفضل حالاً لو مت أو إيذاء نفسك"
  ];

  const [answers, setAnswers] = useState<number[]>(new Array(9).fill(-1));
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
    setAnswers(new Array(9).fill(-1));
    setShowResult(false);
  };

  const totalScore = answers.reduce((a, b) => (b === -1 ? a : a + b), 0);

  const getInterpretation = () => {
    if (totalScore <= 4) return { text: "لا يوجد اكتئاب", color: "text-green-600", bg: "bg-green-50", advice: "حالته المزاجية طبيعية." };
    if (totalScore <= 9) return { text: "اكتئاب خفيف", color: "text-blue-600", bg: "bg-blue-50", advice: "ينصح بالمراقبة، وقد لا يحتاج لعلاج دوائي." };
    if (totalScore <= 14) return { text: "اكتئاب متوسط", color: "text-yellow-600", bg: "bg-yellow-50", advice: "يستحق خطة علاجية (علاج نفسي أو دوائي)." };
    if (totalScore <= 19) return { text: "اكتئاب متوسط الشدة", color: "text-orange-600", bg: "bg-orange-50", advice: "يتطلب علاجاً فعالاً (دوائي و/أو نفسي)." };
    return { text: "اكتئاب شديد", color: "text-red-600", bg: "bg-red-50", advice: "يجب التدخل العلاجي الفوري." };
  };

  const resultData = getInterpretation();

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">استبيان صحة المريض (PHQ-9)</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {!showResult ? (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-sm text-indigo-800 flex gap-3">
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
                      className={`py-2 px-3 rounded-lg text-sm border transition ${answers[i] === val ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={calculateScore} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-indigo-200">عرض النتيجة</button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center animate-in zoom-in-95">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${resultData.bg}`}>
               <Smile className={`w-10 h-10 ${resultData.color}`}/>
            </div>
            <p className="text-slate-500 mb-2">نتيجتك هي</p>
            <p className="text-5xl font-black text-slate-800 mb-2">{totalScore} <span className="text-lg text-slate-400 font-medium">/ 27</span></p>
            <h2 className={`text-2xl font-bold mb-4 ${resultData.color}`}>{resultData.text}</h2>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <p className="text-slate-700 leading-relaxed">{resultData.advice}</p>
            </div>

            {/* Warning for self-harm question */}
            {answers[8] > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 text-red-800 text-sm font-bold flex items-start gap-2 text-right">
                <AlertCircle className="w-5 h-5 shrink-0"/>
                <p>تنبيه: لقد أشرت إلى وجود أفكار حول إيذاء النفس. يرجى طلب المساعدة الطبية فوراً أو التحدث إلى شخص تثق به.</p>
              </div>
            )}

            <button onClick={reset} className="flex items-center justify-center gap-2 mx-auto text-slate-500 hover:text-indigo-600 font-bold">
              <RefreshCw className="w-4 h-4"/> إعادة الاختبار
            </button>
            
            <p className="text-xs text-slate-400 mt-8 border-t pt-4">المصدر: Kroenke K, Spitzer RL, Williams JB. The PHQ-9. J Gen Intern Med. 2001.</p>
          </div>
        )}
      </main>
    </div>
  );
}

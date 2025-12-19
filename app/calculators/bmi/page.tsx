'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scale, ArrowRight, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BMIPage() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // تحويل لـ متر
    const w = parseFloat(weight);
    
    if (!h || !w || h <= 0 || w <= 0) return;

    const bmi = w / (h * h);
    let status = '';
    let color = '';
    let message = '';

    if (bmi < 18.5) {
      status = 'نحافة';
      color = 'bg-blue-100 text-blue-700 border-blue-200';
      message = 'وزنك أقل من المعدل الطبيعي. يُنصح بمراجعة أخصائي تغذية لزيادة الوزن بطريقة صحية.';
    } else if (bmi < 24.9) {
      status = 'وزن طبيعي';
      color = 'bg-green-100 text-green-700 border-green-200';
      message = 'ممتاز! وزنك مثالي ومتناسب مع طولك. حافظ على نمط حياتك الصحي.';
    } else if (bmi < 29.9) {
      status = 'وزن زائد';
      color = 'bg-yellow-100 text-yellow-700 border-yellow-200';
      message = 'وزنك أعلى قليلاً من الطبيعي. ممارسة الرياضة وتنظيم الأكل قد يساعدك.';
    } else {
      status = 'سمنة';
      color = 'bg-red-100 text-red-700 border-red-200';
      message = 'أنت في مرحلة السمنة. هذا قد يعرضك لمخاطر صحية. يُفضل استشارة طبيب.';
    }

    setResult({ value: bmi.toFixed(1), status, color, message });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">حاسبة مؤشر كتلة الجسم (BMI)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Calculator Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl"><Scale className="w-6 h-6 text-blue-600"/></div>
            <div>
              <h2 className="text-lg font-bold">أدخل بياناتك</h2>
              <p className="text-xs text-slate-500">النتيجة دقيقة للبالغين (فوق 18 سنة)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الوزن (كجم)</label>
              <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-200 outline-none" placeholder="مثال: 75" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الطول (سم)</label>
              <input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-200 outline-none" placeholder="مثال: 170" />
            </div>
          </div>

          <button onClick={calculateBMI} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition">احسب النتيجة</button>

          {result && (
            <div className={`mt-6 p-6 rounded-xl border ${result.color} animate-in fade-in slide-in-from-top-4`}>
              <div className="text-center mb-4">
                <p className="text-sm font-bold opacity-80">مؤشر الكتلة لديك</p>
                <p className="text-5xl font-black my-2">{result.value}</p>
                <span className="inline-block px-4 py-1 rounded-full bg-white/50 font-bold border border-black/5">{result.status}</span>
              </div>
              <p className="text-sm text-center leading-relaxed font-medium opacity-90">{result.message}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Info className="w-5 h-5 text-blue-500"/> معلومات تهمك</h3>
          
          <div className="space-y-4 text-sm text-slate-600 leading-7">
            <p>
              <strong>ما هو مؤشر كتلة الجسم؟</strong><br/>
              هو مقياس عالمي يستخدم لتحديد ما إذا كان وزن الشخص صحياً بالنسبة لطوله.
            </p>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="font-bold mb-2 text-slate-800">تصنيف النتائج:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>أقل من 18.5: <span className="text-blue-600">نحافة</span></li>
                <li>18.5 - 24.9: <span className="text-green-600">وزن طبيعي</span></li>
                <li>25 - 29.9: <span className="text-yellow-600">وزن زائد</span></li>
                <li>30 فما فوق: <span className="text-red-600">سمنة</span></li>
              </ul>
            </div>

            <div className="flex gap-2 items-start bg-yellow-50 p-3 rounded-lg text-yellow-800">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5"/>
              <p className="text-xs">
                تنبيه: هذا المؤشر قد لا يكون دقيقاً للرياضيين (بسبب وزن العضلات)، الحوامل، أو كبار السن، حيث لا يفرق بين الدهون والكتلة العضلية.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

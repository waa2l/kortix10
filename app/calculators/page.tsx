'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calculator, Activity, Baby, Brain, Heart, Utensils, 
  ArrowRight, ChevronLeft, Info, Stethoscope, Scale, 
  Calendar, Smile, AlertCircle, Dna, Syringe, TrendingUp
} from 'lucide-react';

// --- تعريف الأنواع ---
type CalculatorCategory = 'general' | 'women' | 'child' | 'mental' | 'nutrition' | 'risk';

interface CalculatorDef {
  id: string;
  title: string;
  icon: any;
  category: CalculatorCategory;
  description: string;
}

// --- قائمة الحاسبات ---
const CALCULATORS: CalculatorDef[] = [
  // عامة وقلب
  { id: 'bmi', title: 'مؤشر كتلة الجسم (BMI)', icon: Scale, category: 'general', description: 'حساب الوزن المثالي وتقييم السمنة' },
  { id: 'bri', title: 'مؤشر استدارة الجسم (BRI)', icon: Activity, category: 'general', description: 'مقياس حديث لتوزيع الدهون في الجسم' },
  { id: 'hr_target', title: 'معدل ضربات القلب المستهدف', icon: Heart, category: 'general', description: 'نطاق النبض المناسب أثناء الرياضة' },
  { id: 'lab_values', title: 'قيم التحاليل الطبية', icon: Dna, category: 'general', description: 'النسب الطبيعية لأشهر التحاليل' },
  { id: 'screening', title: 'الفحص الدوري المناسب', icon: Stethoscope, category: 'general', description: 'الفحوصات الموصى بها حسب السن' },
  
  // نساء وتوليد
  { id: 'due_date', title: 'موعد الولادة المتوقع', icon: Baby, category: 'women', description: 'حساب تاريخ الولادة وعمر الحمل' },
  { id: 'ovulation', title: 'حاسبة التبويض', icon: Calendar, category: 'women', description: 'تحديد أيام الخصوبة العالية' },
  
  // أطفال
  { id: 'pediatric_dose', title: 'جرعات أدوية الأطفال', icon: Syringe, category: 'child', description: 'حساب جرعات خافض الحرارة والمضادات' },
  { id: 'vaccines', title: 'جدول التطعيمات (مصر)', icon: Syringe, category: 'child', description: 'مواعيد التطعيمات الإجبارية حسب العمر' },
  { id: 'growth', title: 'متابعة النمو', icon: TrendingUp, category: 'child', description: 'مقارنة وزن وطول الطفل بالمعدلات الطبيعية' },
  { id: 'milestones', title: 'تطورات الطفل', icon: Baby, category: 'child', description: 'التطور الحركي والعقلي حسب السن' },
  
  // تغذية
  { id: 'calories', title: 'احتياج السعرات اليومي', icon: Utensils, category: 'nutrition', description: 'حساب معدل الحرق والسعرات المطلوبة' },
  { id: 'food_cal', title: 'سعرات الأكل المصري', icon: Utensils, category: 'nutrition', description: 'دليل سعرات أشهر الأكلات المصرية' },
  
  // صحة نفسية
  { id: 'gad7', title: 'مقياس القلق (GAD-7)', icon: Brain, category: 'mental', description: 'تقييم حدة اضطراب القلق العام' },
  { id: 'phq9', title: 'استبيان الاكتئاب (PHQ-9)', icon: Smile, category: 'mental', description: 'تقييم الصحة النفسية والمزاج' },
  { id: 'pain', title: 'تقييم الألم', icon: AlertCircle, category: 'mental', description: 'مقاييس تقييم حدة الألم' },

  // مخاطر وأمراض
  { id: 'cvd_risk', title: 'مخاطر القلب', icon: Heart, category: 'risk', description: 'تقييم احتمالية الإصابة بأمراض القلب' },
  { id: 'diabetes_risk', title: 'مخاطر السكري', icon: Activity, category: 'risk', description: 'تقييم احتمالية الإصابة بالسكري النوع 2' },
  { id: 'osteoporosis', title: 'مخاطر هشاشة العظام', icon: Activity, category: 'risk', description: 'عوامل الخطر لصحة العظام' },
];

export default function CalculatorsPage() {
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // تصفية القائمة
  const filteredCalculators = CALCULATORS.filter(c => c.title.includes(searchTerm));

  // --- المكونات الفرعية للحاسبات ---
  
  // 1. حاسبة BMI
  const BMICalculator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (!h || !w) return;
      
      const bmi = w / (h * h);
      let status = '';
      let color = '';

      if (bmi < 18.5) { status = 'نحافة'; color = 'text-blue-600'; }
      else if (bmi < 25) { status = 'وزن مثالي'; color = 'text-green-600'; }
      else if (bmi < 30) { status = 'وزن زائد'; color = 'text-orange-600'; }
      else { status = 'سمنة'; color = 'text-red-600'; }

      setResult({ bmi: bmi.toFixed(1), status, color });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-bold mb-1">الوزن (كجم)</label><input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-2 border rounded" placeholder="70" /></div>
          <div><label className="block text-sm font-bold mb-1">الطول (سم)</label><input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full p-2 border rounded" placeholder="170" /></div>
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 text-white py-2 rounded font-bold">احسب</button>
        {result && (
          <div className="bg-slate-50 p-4 rounded border mt-4 text-center">
            <p className="text-3xl font-black mb-1">{result.bmi}</p>
            <p className={`font-bold ${result.color}`}>{result.status}</p>
            <p className="text-xs text-slate-500 mt-2">المصدر: منظمة الصحة العالمية (WHO)</p>
          </div>
        )}
      </div>
    );
  };

  // 2. حاسبة الحمل
  const PregnancyCalculator = () => {
    const [lmp, setLmp] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
      if (!lmp) return;
      const lmpDate = new Date(lmp);
      const dueDate = new Date(lmpDate);
      dueDate.setDate(lmpDate.getDate() + 280);
      
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;

      setResult({
        date: dueDate.toLocaleDateString('ar-EG'),
        age: `${weeks} أسبوع و ${days} يوم`
      });
    };

    return (
      <div className="space-y-4">
        <div><label className="block text-sm font-bold mb-1">تاريخ أول يوم في آخر دورة شهرية</label><input type="date" value={lmp} onChange={e=>setLmp(e.target.value)} className="w-full p-2 border rounded" /></div>
        <button onClick={calculate} className="w-full bg-pink-600 text-white py-2 rounded font-bold">احسب</button>
        {result && (
          <div className="bg-pink-50 p-4 rounded border mt-4 text-center">
            <p className="text-sm text-slate-500">موعد الولادة المتوقع</p>
            <p className="text-2xl font-black text-pink-700 mb-2">{result.date}</p>
            <p className="font-bold text-slate-700">عمر الحمل الحالي: {result.age}</p>
            <p className="text-xs text-slate-500 mt-2">المصدر: قاعدة نايجل (Naegele's rule)</p>
          </div>
        )}
      </div>
    );
  };

  // 3. جرعات الأطفال
  const PediatricDose = () => {
    const [weight, setWeight] = useState('');
    const [drug, setDrug] = useState('paracetamol');

    const getDose = () => {
      const w = parseFloat(weight);
      if (!w) return null;
      if (drug === 'paracetamol') return `10-15 مجم (${(w*10).toFixed(0)}-${(w*15).toFixed(0)} مجم) كل 4-6 ساعات.`;
      if (drug === 'ibuprofen') return `5-10 مجم (${(w*5).toFixed(0)}-${(w*10).toFixed(0)} مجم) كل 6-8 ساعات (فوق 6 شهور).`;
      if (drug === 'amoxicillin') return `25-50 مجم (${(w*25).toFixed(0)}-${(w*50).toFixed(0)} مجم) مقسمة على جرعتين أو ثلاث يومياً.`;
      return '';
    };

    return (
      <div className="space-y-4">
        <div><label className="block text-sm font-bold mb-1">وزن الطفل (كجم)</label><input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-2 border rounded" /></div>
        <div>
          <label className="block text-sm font-bold mb-1">الدواء</label>
          <select value={drug} onChange={e=>setDrug(e.target.value)} className="w-full p-2 border rounded bg-white">
            <option value="paracetamol">باراسيتامول (سيتال/بانادول)</option>
            <option value="ibuprofen">إيبوبروفين (بروفين/كونتافيفر)</option>
            <option value="amoxicillin">أموكسيسيلين (مضاد حيوي)</option>
          </select>
        </div>
        {weight && (
          <div className="bg-blue-50 p-4 rounded border mt-4">
            <p className="font-bold text-blue-800">{getDose()}</p>
            <p className="text-xs text-red-500 mt-2 font-bold">⚠️ تنبيه: هذه أرقام استرشادية فقط. يجب مراجعة الطبيب قبل إعطاء أي دواء.</p>
            <p className="text-xs text-slate-400 mt-1">المصدر: Nelson Textbook of Pediatrics</p>
          </div>
        )}
      </div>
    );
  };

  // 4. مقياس القلق GAD-7
  const GAD7Calculator = () => {
    const questions = [
      "الشعور بالعصبية أو القلق أو التوتر",
      "عدم القدرة على وقف القلق أو السيطرة عليه",
      "القلق المفرط بشأن أشياء مختلفة",
      "صعوبة في الاسترخاء",
      "الشعور بعدم الاستقرار لدرجة صعوبة الجلوس",
      "سرعة الانفعال أو حدة الطبع",
      "الشعور بالخوف وكأن شيئاً فظيعاً سيحدث"
    ];
    const [scores, setScores] = useState<number[]>(new Array(7).fill(0));
    const total = scores.reduce((a, b) => a + b, 0);

    const getResult = () => {
      if (total <= 4) return "قلق بسيط جداً";
      if (total <= 9) return "قلق خفيف";
      if (total <= 14) return "قلق متوسط";
      return "قلق شديد";
    };

    return (
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={i} className="bg-slate-50 p-3 rounded">
            <p className="font-bold text-sm mb-2 text-slate-700">{i+1}. {q}</p>
            <div className="flex gap-2 text-xs">
              {[0,1,2,3].map(val => (
                <button key={val} onClick={()=>{const n=[...scores]; n[i]=val; setScores(n);}} 
                  className={`flex-1 py-2 rounded border ${scores[i]===val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}>
                  {val===0?'أبداً':val===1?'عدة أيام':val===2?'أكثر من نصف الأيام':'يومياً تقريباً'}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="bg-blue-100 p-4 rounded text-center">
          <p className="text-sm font-bold">النتيجة: {total} / 21</p>
          <p className="text-xl font-black text-blue-800">{getResult()}</p>
          <p className="text-xs text-slate-500 mt-2">المصدر: Spitzer RL, et al. Arch Intern Med. 2006</p>
        </div>
      </div>
    );
  };

  // 5. حاسبة BRI
  const BRICalculator = () => {
    const [h, setH] = useState('');
    const [waist, setWaist] = useState('');
    const [res, setRes] = useState<any>(null);

    const calc = () => {
      const heightM = parseFloat(h)/100;
      const waistM = parseFloat(waist)/100;
      if(!heightM || !waistM) return;
      // BRI Formula: 364.2 - 365.5 * sqrt(1 - ( (waist/2π) / (0.5*height) )^2 )
      const term = Math.pow((waistM / (2 * Math.PI)) / (0.5 * heightM), 2);
      const bri = 364.2 - (365.5 * Math.sqrt(1 - term));
      setRes(bri.toFixed(2));
    };

    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500 bg-yellow-50 p-2 rounded">مؤشر استدارة الجسم (Body Roundness Index) يعتبر أدق من BMI في توقع المخاطر الصحية لأنه يعتمد على محيط الخصر.</p>
        <div className="grid grid-cols-2 gap-4">
           <div><label className="text-sm font-bold">الطول (سم)</label><input type="number" value={h} onChange={e=>setH(e.target.value)} className="w-full p-2 border rounded"/></div>
           <div><label className="text-sm font-bold">محيط الخصر (سم)</label><input type="number" value={waist} onChange={e=>setWaist(e.target.value)} className="w-full p-2 border rounded"/></div>
        </div>
        <button onClick={calc} className="w-full bg-indigo-600 text-white py-2 rounded font-bold">احسب</button>
        {res && <div className="text-center p-4 bg-indigo-50 rounded mt-4"><p className="text-3xl font-black text-indigo-800">{res}</p><p className="text-sm">المعدل الصحي عادة ما بين 1 إلى 5</p></div>}
      </div>
    );
  };

  // 6. سعرات الطعام المصري (JSON)
  const FoodCalories = () => {
    const foods = [
      { name: 'رغيف عيش بلدي', cal: 300 },
      { name: 'طبق فول (200جم)', cal: 220 },
      { name: 'طعمية (قرص)', cal: 60 },
      { name: 'طبق كشري متوسط', cal: 500 },
      { name: 'قطعة مكرونة بشاميل', cal: 400 },
      { name: 'محشي (صابع)', cal: 35 },
      { name: 'كوب شاي بحليب', cal: 80 },
      { name: 'قطعة بسبوسة', cal: 250 },
    ];
    return (
      <div className="space-y-2">
        <input type="text" placeholder="بحث..." className="w-full p-2 border rounded mb-2" />
        <div className="h-64 overflow-y-auto border rounded divide-y">
          {foods.map((f, i) => (
            <div key={i} className="flex justify-between p-3 hover:bg-slate-50">
              <span className="font-bold text-slate-700">{f.name}</span>
              <span className="text-blue-600 font-mono">{f.cal} سعرة</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">المصدر: المعهد القومي للتغذية</p>
      </div>
    );
  };

  // 7. التطعيمات في مصر
  const VaccinesInfo = () => {
    const schedule = [
      { age: 'عند الولادة', vac: 'كبدي (ب) - شلل أطفال (فموي) - درن (BCG)' },
      { age: 'شهرين', vac: 'خماسي - شلل أطفال (فموي+حقن) - مكورات رئوية' },
      { age: '4 شهور', vac: 'خماسي - شلل أطفال (فموي+حقن) - مكورات رئوية' },
      { age: '6 شهور', vac: 'خماسي - شلل أطفال (فموي) - مكورات رئوية' },
      { age: '9 شهور', vac: 'شلل أطفال (فموي)' },
      { age: '12 شهر', vac: 'شلل أطفال - MMR (حصبة ونكاف وحصبة ألماني)' },
      { age: '18 شهر', vac: 'منشطة (ثلاثي وشلل أطفال و MMR)' },
    ];
    return (
      <div className="space-y-3">
        {schedule.map((item, i) => (
          <div key={i} className="flex gap-3 items-start bg-white p-3 border rounded shadow-sm">
            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">{item.age}</div>
            <p className="text-sm text-slate-700 font-bold">{item.vac}</p>
          </div>
        ))}
        <p className="text-xs text-slate-500 mt-2">المصدر: وزارة الصحة والسكان المصرية (الجدول الإجباري)</p>
      </div>
    );
  };

  // دالة لعرض المكون المناسب
  const renderActiveCalculator = () => {
    switch (activeCalc) {
      case 'bmi': return <BMICalculator />;
      case 'due_date': return <PregnancyCalculator />;
      case 'pediatric_dose': return <PediatricDose />;
      case 'gad7': return <GAD7Calculator />;
      case 'bri': return <BRICalculator />;
      case 'food_cal': return <FoodCalories />;
      case 'vaccines': return <VaccinesInfo />;
      // للحاسبات الأخرى سنعرض رسالة مؤقتة لتوفير مساحة الكود، يمكنك تكرار النمط أعلاه
      default: return (
        <div className="text-center py-10">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-4"/>
          <p className="text-slate-500">سيتم إضافة هذه الحاسبة قريباً...</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo" dir="rtl">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeCalc ? (
              <button onClick={() => setActiveCalc(null)} className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-bold">
                <ChevronLeft className="w-5 h-5"/> عودة للقائمة
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/" className="p-2 hover:bg-slate-100 rounded text-slate-400"><ArrowRight/></Link>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-blue-600"/> الحاسبات الطبية
                </h1>
              </div>
            )}
          </div>
          
          {activeCalc && (
            <h2 className="font-bold text-blue-800 text-sm md:text-base">
              {CALCULATORS.find(c => c.id === activeCalc)?.title}
            </h2>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        
        {activeCalc ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-bottom-4 fade-in">
            {renderActiveCalculator()}
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-6">
               <input 
                 type="text" 
                 placeholder="ابحث عن حاسبة (مثال: الحمل، السعرات...)" 
                 className="w-full p-4 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCalculators.map((calc) => {
                const Icon = calc.icon;
                const colors = {
                    general: 'bg-blue-50 text-blue-600 border-blue-100',
                    women: 'bg-pink-50 text-pink-600 border-pink-100',
                    child: 'bg-purple-50 text-purple-600 border-purple-100',
                    mental: 'bg-teal-50 text-teal-600 border-teal-100',
                    nutrition: 'bg-green-50 text-green-600 border-green-100',
                    risk: 'bg-red-50 text-red-600 border-red-100',
                };
                
                return (
                  <button 
                    key={calc.id}
                    onClick={() => setActiveCalc(calc.id)}
                    className="flex flex-col items-start p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-right group"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colors[calc.category]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{calc.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{calc.description}</p>
                  </button>
                );
              })}
            </div>
          </>
        )}

      </main>
    </div>
  );
}

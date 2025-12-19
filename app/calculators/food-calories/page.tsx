'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Utensils, ArrowRight, Search } from 'lucide-react';

export default function FoodCaloriesPage() {
  const [search, setSearch] = useState('');

  const foods = [
    { name: 'رغيف عيش بلدي (كامل)', cal: 300, unit: 'رغيف' },
    { name: 'رغيف عيش فينو', cal: 160, unit: 'رغيف متوسط' },
    { name: 'طعمية (فلافل)', cal: 60, unit: 'قرص متوسط' },
    { name: 'فول مدمس (بدون زيت)', cal: 220, unit: 'طبق متوسط (200جم)' },
    { name: 'كشري مصري', cal: 550, unit: 'طبق متوسط' },
    { name: 'مكرونة بشاميل', cal: 400, unit: 'قطعة متوسطة' },
    { name: 'محشي كرنب/ورق عنب', cal: 35, unit: 'صابع واحد' },
    { name: 'ملوخية', cal: 120, unit: 'طبق متوسط' },
    { name: 'أرز أبيض مطبوخ', cal: 200, unit: 'كوب مطبوخ' },
    { name: 'بامية باللحم', cal: 250, unit: 'طبق متوسط' },
    { name: 'فتة مصرية (لحم وخل وثوم)', cal: 600, unit: 'طبق متوسط' },
    { name: 'حلاوة طحينية', cal: 100, unit: 'ملعقة كبيرة' },
    { name: 'قطايف (بالمكسرات)', cal: 340, unit: 'قطعتين' },
    { name: 'كنافة', cal: 400, unit: 'قطعة (100جم)' },
    { name: 'شاي بحليب (كامل الدسم)', cal: 80, unit: 'كوب' },
    { name: 'جبنة قريش', cal: 100, unit: 'قطعة (100جم)' },
    { name: 'بيض مسلوق', cal: 75, unit: 'بيضة واحدة' },
    { name: 'بيض مقلي (زيت قليل)', cal: 100, unit: 'بيضة واحدة' },
  ];

  const filteredFoods = foods.filter(f => f.name.includes(search));

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">دليل سعرات الأكل المصري</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* [Image of egyptian food nutrition facts] */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative mb-6">
            <Search className="absolute right-3 top-3.5 text-slate-400 w-5 h-5"/>
            <input 
              type="text" 
              placeholder="ابحث عن أكلة (مثال: طعمية، محشي...)" 
              value={search}
              onChange={e=>setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border rounded-xl outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-200"
            />
          </div>

          <div className="space-y-2 h-[60vh] overflow-y-auto custom-scrollbar">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-yellow-50 rounded-xl border border-transparent hover:border-yellow-200 transition group">
                  <div>
                    <p className="font-bold text-slate-800">{f.name}</p>
                    <p className="text-xs text-slate-500">{f.unit}</p>
                  </div>
                  <div className="text-left">
                    <span className="font-black text-yellow-600 text-xl">{f.cal}</span>
                    <span className="text-xs text-slate-400 block">سعرة</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">لا توجد نتائج مطابقة</div>
            )}
          </div>
          
          <p className="text-xs text-slate-400 mt-4 text-center">المصدر: المعهد القومي للتغذية (جداول تحليل الأطعمة المصرية)</p>
        </div>
      </main>
    </div>
  );
}

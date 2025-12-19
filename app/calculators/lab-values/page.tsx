'use client';

import { useState } from 'react';
import Link from 'next/link';
// تم إضافة Info هنا 👇
import { Activity, ArrowRight, Search, Dna, Info } from 'lucide-react';

export default function LabValuesPage() {
  const [search, setSearch] = useState('');

  const labs = [
    { name: 'Hemoglobin (Hb)', category: 'صورة دم', normal: 'M: 13.5-17.5 | F: 12.0-15.5', unit: 'g/dL' },
    { name: 'WBCs (كرات الدم البيضاء)', category: 'صورة دم', normal: '4,500 - 11,000', unit: 'cells/mcL' },
    { name: 'Platelets (الصفائح)', category: 'صورة دم', normal: '150,000 - 450,000', unit: 'mcL' },
    { name: 'Fasting Glucose (سكر صائم)', category: 'سكري', normal: '70 - 99', unit: 'mg/dL' },
    { name: 'HbA1c (سكر تراكمي)', category: 'سكري', normal: '< 5.7%', unit: '%' },
    { name: 'Creatinine (كرياتينين)', category: 'كلى', normal: 'M: 0.7-1.3 | F: 0.6-1.1', unit: 'mg/dL' },
    { name: 'ALT (SGPT)', category: 'كبد', normal: '7 - 56', unit: 'U/L' },
    { name: 'AST (SGOT)', category: 'كبد', normal: '8 - 48', unit: 'U/L' },
    { name: 'TSH (الغدة الدرقية)', category: 'هرمونات', normal: '0.4 - 4.0', unit: 'mIU/L' },
    { name: 'Vitamin D', category: 'فيتامينات', normal: '30 - 100', unit: 'ng/mL' },
    { name: 'Cholesterol Total', category: 'دهون', normal: '< 200', unit: 'mg/dL' },
    { name: 'Triglycerides (دهون ثلاثية)', category: 'دهون', normal: '< 150', unit: 'mg/dL' },
    { name: 'Uric Acid (نقرص)', category: 'كلى', normal: 'M: 3.4-7.0 | F: 2.4-6.0', unit: 'mg/dL' },
  ];

  const filteredLabs = labs.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 font-cairo pb-12" dir="rtl">
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/calculators" className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight className="w-5 h-5"/></Link>
          <h1 className="font-bold text-slate-800">القيم الطبيعية للتحاليل (Reference Ranges)</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative mb-6">
            <Search className="absolute right-3 top-3.5 text-slate-400 w-5 h-5"/>
            <input 
              type="text" 
              placeholder="ابحث بالاسم (مثال: Hb, TSH...)" 
              value={search}
              onChange={e=>setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 dir-ltr text-right placeholder:text-right"
            />
          </div>

          <div className="space-y-3">
            {filteredLabs.length > 0 ? (
              filteredLabs.map((lab, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-100 p-1.5 rounded"><Dna className="w-4 h-4 text-indigo-600"/></div>
                      <h3 className="font-bold text-slate-800 dir-ltr">{lab.name}</h3>
                    </div>
                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{lab.category}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-100 pt-2 mt-2">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">المعدل الطبيعي</p>
                      <p className="font-bold text-indigo-700 dir-ltr">{lab.normal}</p>
                    </div>
                    <p className="text-xs font-mono text-slate-400">{lab.unit}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">لا توجد نتائج</div>
            )}
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg mt-6 flex gap-2 text-yellow-800 text-xs">
             <Info className="w-4 h-4 shrink-0 mt-0.5"/>
             <p>تختلف القيم الطبيعية قليلاً من معمل لآخر حسب الأجهزة المستخدمة. يرجى دائماً مقارنة نتيجتك بـ "Reference Range" المكتوب في ورقة التحليل الخاصة بك.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

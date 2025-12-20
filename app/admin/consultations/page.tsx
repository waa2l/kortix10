'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { PrescriptionView } from '@/components/PrescriptionView';
import { Search, Printer, Eye, X, FileText } from 'lucide-react';

export default function AdminConsultationsHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // 1. تحديث الاستعلام لجلب الوزن والطول أيضاً
      const { data } = await supabase
        .from('consultations')
        .select('*, patient:patients(full_name, weight_kg, height_cm), doctor:doctors(full_name)')
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });
      if (data) setHistory(data);
    };
    fetchHistory();
  }, []);

  const handlePrint = () => {
    if(printRef.current) {
       const original = document.body.innerHTML;
       document.body.innerHTML = printRef.current.outerHTML;
       window.print();
       window.location.reload();
    }
  };

  // 2. تحديث دالة تحويل البيانات لتناسب الروشتة الجديدة
  const parseData = (consultation: any) => {
    let meds = [];
    let msgs = [];
    try { meds = JSON.parse(consultation.medicines || '[]'); } catch {}
    try { msgs = JSON.parse(consultation.health_messages || '[]'); } catch { 
       if(consultation.health_messages) msgs = [consultation.health_messages];
    }
    
    return {
      // البيانات الأساسية
      patientName: consultation.patient?.full_name || 'غير معروف',
      doctorName: consultation.doctor?.full_name || 'طبيب',
      centerName: 'المركز الطبي الذكي',
      date: new Date(consultation.updated_at).toLocaleDateString('ar-EG'),
      
      // البيانات الحيوية (التي تسببت في الخطأ لغيابها)
      age: '-', // يمكن حسابه إذا توفر تاريخ الميلاد
      weight: consultation.patient?.weight_kg,
      height: consultation.patient?.height_cm,
      
      // المحتوى الطبي
      complaint: consultation.complaint_text || 'لا توجد شكوى مسجلة', // <--- هذا هو الحقل الناقص
      diagnosis: consultation.response_text?.split('\n')[0]?.replace('التشخيص: ', '') || 'غير محدد',
      medicines: meds,
      tests: consultation.tests ? consultation.tests.split(',') : [],
      imaging: consultation.imaging ? consultation.imaging.split(',') : [],
      healthMessages: msgs,
      notes: consultation.response_text,
      
      // لا يوجد تاريخ متابعة في الأرشيف القديم، يمكن تركه فارغاً
      followUpDate: undefined 
    };
  };

  const filtered = history.filter(h => 
    h.patient?.full_name.includes(search) || 
    h.specialization.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-cairo" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <FileText className="text-blue-600"/> أرشيف الاستشارات الطبية
      </h1>

      <div className="relative mb-6">
        <Search className="absolute right-3 top-3 text-slate-400"/>
        <input 
          className="w-full p-3 pr-10 rounded-xl border border-slate-300" 
          placeholder="ابحث باسم المريض أو التخصص..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-100 text-slate-600 font-bold">
            <tr>
              <th className="p-4">المريض</th>
              <th className="p-4">الطبيب</th>
              <th className="p-4">التخصص</th>
              <th className="p-4">تاريخ الإغلاق</th>
              <th className="p-4">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-t hover:bg-slate-50">
                <td className="p-4 font-bold">{item.patient?.full_name}</td>
                <td className="p-4">{item.doctor?.full_name || '-'}</td>
                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{item.specialization}</span></td>
                <td className="p-4 font-mono text-sm">{new Date(item.updated_at).toLocaleDateString('ar-EG')}</td>
                <td className="p-4">
                  <button onClick={() => setSelected(item)} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1 font-bold text-sm">
                    <Eye className="w-4 h-4"/> عرض الروشتة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal View */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-slate-100">
                 <h2 className="font-bold text-lg">تفاصيل الروشتة المؤرشفة</h2>
                 <div className="flex gap-2">
                    <button onClick={handlePrint} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex gap-2 items-center text-sm"><Printer className="w-4 h-4"/> طباعة</button>
                    <button onClick={() => setSelected(null)} className="bg-red-100 text-red-600 p-2 rounded-lg"><X className="w-5 h-5"/></button>
                 </div>
              </div>
              
              <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center">
                 {/* تمرير البيانات المعالجة للمكون */}
                 <PrescriptionView ref={printRef} {...parseData(selected)} />
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

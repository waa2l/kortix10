'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Filter, CheckCircle, XCircle, AlertTriangle, 
  Eye, MessageSquare, ArrowLeft, Trash2 
} from 'lucide-react';

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, open, completed, flagged
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('consultations')
      .select('*, patient:patients(full_name), doctor:doctors(full_name)')
      .order('created_at', { ascending: false });
    
    if (data) setConsultations(data);
    setLoading(false);
  };

  // الفلترة
  const filtered = consultations.filter(c => {
    const matchesSearch = 
      c.patient?.full_name?.includes(search) || 
      c.consultation_code?.includes(search) ||
      c.specialization?.includes(search);
    
    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'flagged') return c.is_flagged || c.status === 'flagged';
    return c.status === filter;
  });

  // حذف استشارة
  const handleDelete = async (id: string) => {
    if(confirm('حذف نهائي؟')) {
      await supabase.from('consultations').delete().eq('id', id);
      setConsultations(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-cairo" dir="rtl">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">إدارة الاستشارات الطبية (شامل)</h1>
        <div className="flex gap-2">
           <span className="bg-white px-3 py-1 rounded shadow text-sm">العدد الكلي: <b>{consultations.length}</b></span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex gap-2">
            <button onClick={()=>setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter==='all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>الكل</button>
            <button onClick={()=>setFilter('open')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter==='open' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>مفتوحة</button>
            <button onClick={()=>setFilter('completed')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter==='completed' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'}`}>مغلقة</button>
            <button onClick={()=>setFilter('flagged')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter==='flagged' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>بلاغات <AlertTriangle className="w-3 h-3 inline"/></button>
         </div>
         
         <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
            <input 
              className="w-full pl-4 pr-10 py-2 border rounded-xl" 
              placeholder="بحث برقم الكود، اسم المريض، التخصص..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-100 text-slate-600 font-bold text-sm">
            <tr>
              <th className="p-4">الكود</th>
              <th className="p-4">المريض</th>
              <th className="p-4">التخصص</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الطبيب المعالج</th>
              <th className="p-4">تاريخ الإنشاء</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.map(item => (
              <tr key={item.id} className={`border-t hover:bg-slate-50 ${item.is_flagged ? 'bg-red-50' : ''}`}>
                <td className="p-4 font-mono font-bold text-slate-500">{item.consultation_code}</td>
                <td className="p-4 font-bold text-slate-800">{item.patient?.full_name}</td>
                <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{item.specialization}</span></td>
                <td className="p-4">
                   {item.status === 'open' && <span className="text-blue-600 font-bold flex items-center gap-1"><MessageSquare className="w-3 h-3"/> مفتوحة</span>}
                   {item.status === 'completed' && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> مغلقة</span>}
                   {(item.status === 'flagged' || item.is_flagged) && <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> مسيئة</span>}
                </td>
                <td className="p-4 text-slate-500">{item.doctor?.full_name || '-'}</td>
                <td className="p-4 dir-ltr text-right">{new Date(item.created_at).toLocaleDateString('ar-EG')}</td>
                <td className="p-4 flex gap-2">
                   <button className="text-blue-600 bg-blue-50 p-2 rounded hover:bg-blue-100" title="عرض التفاصيل"><Eye className="w-4 h-4"/></button>
                   {item.status === 'open' && (
                     <button className="text-green-600 bg-green-50 p-2 rounded hover:bg-green-100" title="الرد كمدير"><MessageSquare className="w-4 h-4"/></button>
                   )}
                   <button onClick={()=>handleDelete(item.id)} className="text-red-600 bg-red-50 p-2 rounded hover:bg-red-100" title="حذف"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && <div className="text-center py-10 text-slate-400">لا توجد نتائج</div>}
      </div>

    </div>
  );
}

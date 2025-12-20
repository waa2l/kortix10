'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Activity, Droplet, Scale, Thermometer } from 'lucide-react';

export default function HealthRecords() {
  const [logs, setLogs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newLog, setNewLog] = useState({ type: 'pressure', val1: '', val2: '', notes: '' });

  // جلب السجلات
  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // نحتاج أولاً معرفة patient_id
    const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single();
    if (!patient) return;

    const { data } = await supabase
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', patient.id)
      .order('measured_at', { ascending: false });
    
    if (data) setLogs(data);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user?.id).single();
    
    if (!patient) return;

    await supabase.from('patient_vitals').insert({
      patient_id: patient.id,
      vital_type: newLog.type,
      value_1: newLog.val1,
      value_2: newLog.val2 || null, // اختياري
      notes: newLog.notes
    });

    setShowModal(false);
    fetchLogs(); // تحديث القائمة
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">سجلاتي الصحية</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4"/> إضافة قراءة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* بطاقات ملخص (يمكن حساب المتوسط هنا لاحقاً) */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 mb-2"><Activity className="w-5 h-5"/> ضغط الدم</div>
            <p className="text-2xl font-bold">120/80</p>
            <p className="text-xs text-slate-400">آخر قراءة</p>
         </div>
         {/* ... تكرار لباقي المؤشرات ... */}
      </div>

      {/* جدول السجل */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 font-bold">
            <tr>
              <th className="p-4">النوع</th>
              <th className="p-4">القيمة</th>
              <th className="p-4">التاريخ</th>
              <th className="p-4">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-4">
                  {log.vital_type === 'pressure' && 'ضغط دم'}
                  {log.vital_type === 'sugar' && 'سكر'}
                  {log.vital_type === 'weight' && 'وزن'}
                </td>
                <td className="p-4 font-bold dir-ltr">
                  {log.value_1} {log.value_2 ? `/ ${log.value_2}` : ''}
                </td>
                <td className="p-4 text-sm text-slate-500">{new Date(log.measured_at).toLocaleDateString('ar-EG')}</td>
                <td className="p-4 text-sm">{log.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal إضافة */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
              <h3 className="font-bold text-lg">تسجيل قراءة جديدة</h3>
              
              <div>
                <label className="block text-sm font-bold mb-1">النوع</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={newLog.type}
                  onChange={e => setNewLog({...newLog, type: e.target.value})}
                >
                  <option value="pressure">ضغط الدم</option>
                  <option value="sugar">السكر</option>
                  <option value="weight">الوزن</option>
                  <option value="temperature">الحرارة</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-1">القيمة {newLog.type === 'pressure' ? '(العالي)' : ''}</label>
                  <input type="number" className="w-full p-2 border rounded" value={newLog.val1} onChange={e=>setNewLog({...newLog, val1: e.target.value})}/>
                </div>
                {newLog.type === 'pressure' && (
                  <div className="flex-1">
                    <label className="block text-sm font-bold mb-1">القيمة (الواطي)</label>
                    <input type="number" className="w-full p-2 border rounded" value={newLog.val2} onChange={e=>setNewLog({...newLog, val2: e.target.value})}/>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">ملاحظات</label>
                <textarea className="w-full p-2 border rounded" value={newLog.notes} onChange={e=>setNewLog({...newLog, notes: e.target.value})}/>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">حفظ</button>
                <button onClick={()=>setShowModal(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded font-bold">إلغاء</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorRequests() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    request_type: 'annual_leave', // annual_leave, emergency_leave, sick_leave
    from_date: '',
    to_date: '',
    assigned_to: '',
    notes: ''
  });

  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctorData');
    if (storedDoctor) {
      const { id } = JSON.parse(storedDoctor);
      setDoctorId(id);
      fetchData(id);
    }
  }, []);

  const fetchData = async (id: string) => {
    try {
      setLoading(true);
      
      // Get Doctor Info (Balances)
      const { data: docData } = await supabase.from('doctors').select('*').eq('id', id).single();
      setDoctorInfo(docData);

      // Get Requests History
      const { data: reqData } = await supabase
        .from('doctor_requests')
        .select('*')
        .eq('doctor_id', id)
        .order('created_at', { ascending: false });
      
      setRequests(reqData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;
    
    try {
      const { error } = await supabase.from('doctor_requests').insert([{
        doctor_id: doctorId,
        ...formData,
        status: 'pending'
      }]);

      if (error) throw error;
      alert('تم إرسال الطلب بنجاح');
      setFormData({ request_type: 'annual_leave', from_date: '', to_date: '', assigned_to: '', notes: '' });
      fetchData(doctorId);
    } catch (error: any) {
      alert('خطأ: ' + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6 font-cairo">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600"/> طلبات الإجازات
      </h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
          <span className="text-blue-700 font-bold">رصيد الإجازات السنوية</span>
          <span className="text-2xl font-black text-blue-800">{doctorInfo?.annual_leave_balance || 0} يوم</span>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center">
          <span className="text-orange-700 font-bold">رصيد الإجازات العارضة</span>
          <span className="text-2xl font-black text-orange-800">{doctorInfo?.emergency_leave_balance || 0} يوم</span>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4">تقديم طلب جديد</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-sm text-slate-600 mb-1">نوع الإجازة</label>
            <select 
              value={formData.request_type} 
              onChange={e => setFormData({...formData, request_type: e.target.value})}
              className="w-full border rounded-lg p-2"
            >
              <option value="annual_leave">إجازة سنوية</option>
              <option value="emergency_leave">إجازة عارضة</option>
              <option value="sick_leave">إجازة مرضية</option>
              <option value="permission">إذن انصراف/تأخير</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">القائم بالعمل (بديل)</label>
            <input 
              type="text" 
              value={formData.assigned_to} 
              onChange={e => setFormData({...formData, assigned_to: e.target.value})}
              className="w-full border rounded-lg p-2"
              placeholder="اسم الطبيب البديل"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">من تاريخ</label>
            <input 
              type="date" 
              value={formData.from_date} 
              onChange={e => setFormData({...formData, from_date: e.target.value})}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">إلى تاريخ</label>
            <input 
              type="date" 
              value={formData.to_date} 
              onChange={e => setFormData({...formData, to_date: e.target.value})}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-600 mb-1">ملاحظات / سبب</label>
            <textarea 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded-lg p-2"
              rows={2}
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
              <Send className="w-5 h-5" /> إرسال الطلب
            </button>
          </div>

        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="p-4 bg-slate-50 font-bold border-b text-slate-700">طلباتي السابقة</h3>
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="p-4">النوع</th>
              <th className="p-4">الفترة</th>
              <th className="p-4">البديل</th>
              <th className="p-4">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t hover:bg-slate-50 text-sm">
                <td className="p-4 font-bold">
                  {req.request_type === 'annual_leave' ? 'سنوية' : 
                   req.request_type === 'emergency_leave' ? 'عارضة' : 
                   req.request_type === 'sick_leave' ? 'مرضية' : 'إذن'}
                </td>
                <td className="p-4 text-slate-600">
                  {req.from_date} <span className="text-slate-400 mx-1">إلى</span> {req.to_date}
                </td>
                <td className="p-4 text-slate-600">{req.assigned_to || '-'}</td>
                <td className="p-4">
                  {req.status === 'pending' && <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold"><Clock className="w-3 h-3"/> قيد الانتظار</span>}
                  {req.status === 'approved' && <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold"><CheckCircle className="w-3 h-3"/> مقبول</span>}
                  {req.status === 'rejected' && <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold"><XCircle className="w-3 h-3"/> مرفوض</span>}
                </td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">لا توجد طلبات سابقة</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit, Save, X, UserMd } from 'lucide-react';

export default function DoctorsSettings() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // النموذج يطابق قاعدة البيانات (doctors table)
  const [formData, setFormData] = useState({
    full_name: '',
    doctor_number: '',
    specialization: '',
    phone: '',
    national_id: '',
    clinic_id: '',
    work_days: '', // String like "Sat,Sun,Mon"
    shift: 'morning',
    email: '',
    image_url: '', // Text URL input
    work_status: 'active',
    annual_leave_balance: '30',
    emergency_leave_balance: '7',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: clinicsData } = await supabase.from('clinics').select('id, clinic_name');
      setClinics(clinicsData || []);

      const { data: doctorsData, error } = await supabase
        .from('doctors')
        .select(`*, clinics (clinic_name)`)
        .order('full_name');
      
      if (error) throw error;
      setDoctors(doctorsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        clinic_id: formData.clinic_id || null,
        annual_leave_balance: parseInt(formData.annual_leave_balance) || 0,
        emergency_leave_balance: parseInt(formData.emergency_leave_balance) || 0,
      };

      if (isEditing && currentId) {
        const { error } = await supabase.from('doctors').update(payload).eq('id', currentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('doctors').insert([payload]);
        if (error) throw error;
      }

      // Reset
      setFormData({
        full_name: '', doctor_number: '', specialization: '', phone: '', national_id: '',
        clinic_id: '', work_days: '', shift: 'morning', email: '', image_url: '',
        work_status: 'active', annual_leave_balance: '30', emergency_leave_balance: '7', notes: ''
      });
      setIsEditing(false);
      setCurrentId(null);
      fetchData();
      alert('تم حفظ بيانات الطبيب');
    } catch (error: any) {
      alert('خطأ: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الطبيب؟')) return;
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (!error) fetchData(); else alert('خطأ في الحذف');
  };

  const handleEdit = (doc: any) => {
    setIsEditing(true);
    setCurrentId(doc.id);
    setFormData({
      full_name: doc.full_name || '',
      doctor_number: doc.doctor_number || '',
      specialization: doc.specialization || '',
      phone: doc.phone || '',
      national_id: doc.national_id || '',
      clinic_id: doc.clinic_id || '',
      work_days: doc.work_days || '',
      shift: doc.shift || 'morning',
      email: doc.email || '',
      image_url: doc.image_url || '',
      work_status: doc.work_status || 'active',
      annual_leave_balance: doc.annual_leave_balance?.toString() || '30',
      emergency_leave_balance: doc.emergency_leave_balance?.toString() || '7',
      notes: doc.notes || ''
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-cairo" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <UserMd className="text-blue-600"/> إدارة الأطباء
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="الاسم الكامل" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="border p-2 rounded" required />
          <input placeholder="كود الطبيب" value={formData.doctor_number} onChange={e => setFormData({...formData, doctor_number: e.target.value})} className="border p-2 rounded" required />
          <input placeholder="التخصص" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="border p-2 rounded" required />
          <input placeholder="رقم الهاتف" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border p-2 rounded" />
          <input placeholder="الرقم القومي" value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} className="border p-2 rounded" />
          
          <select value={formData.clinic_id} onChange={e => setFormData({...formData, clinic_id: e.target.value})} className="border p-2 rounded">
            <option value="">-- اختر العيادة --</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
          </select>

          <input placeholder="أيام العمل (مثال: سبت، أحد)" value={formData.work_days} onChange={e => setFormData({...formData, work_days: e.target.value})} className="border p-2 rounded" />
          
          <select value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} className="border p-2 rounded">
            <option value="morning">صباحي</option>
            <option value="evening">مسائي</option>
          </select>

          <input placeholder="رابط الصورة (URL)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="border p-2 rounded" />
          <input placeholder="البريد الإلكتروني" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border p-2 rounded" />
          
          <div className="md:col-span-3 flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded flex-1">{isEditing ? 'تحديث البيانات' : 'إضافة طبيب'}</button>
            {isEditing && <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 rounded">إلغاء</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-right min-w-[800px]">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">التخصص</th>
              <th className="p-4">العيادة</th>
              <th className="p-4">الهاتف</th>
              <th className="p-4">تحكم</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc.id} className="border-t hover:bg-slate-50">
                <td className="p-4 font-bold">{doc.full_name}</td>
                <td className="p-4">{doc.specialization}</td>
                <td className="p-4">{doc.clinics?.clinic_name || '-'}</td>
                <td className="p-4">{doc.phone}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(doc)} className="text-blue-600"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(doc.id)} className="text-red-600"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-center">جاري التحميل...</p>}
      </div>
    </div>
  );
}

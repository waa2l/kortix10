'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit, Save, X, Activity } from 'lucide-react';

export default function ClinicsSettings() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]); // للقائمة المنسدلة
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // النموذج يطابق قاعدة البيانات بدقة
  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_number: '',
    control_password: '',
    screen_id: '',
    max_daily_appointments: '50',
    morning_shift_start: '08:00',
    morning_shift_end: '14:00',
    evening_shift_start: '14:00',
    evening_shift_end: '20:00',
    is_active: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // جلب الشاشات للقائمة
      const { data: screensData } = await supabase.from('screens').select('id, screen_number').order('screen_number');
      setScreens(screensData || []);

      // جلب العيادات مع بيانات الشاشة المرتبطة
      const { data: clinicsData, error } = await supabase
        .from('clinics')
        .select(`*, screens (screen_number)`)
        .order('clinic_number');
      
      if (error) throw error;
      setClinics(clinicsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        clinic_name: formData.clinic_name,
        clinic_number: parseInt(formData.clinic_number),
        control_password: formData.control_password,
        screen_id: formData.screen_id || null, // يمكن أن تكون null
        max_daily_appointments: parseInt(formData.max_daily_appointments),
        morning_shift_start: formData.morning_shift_start + ':00', // إضافة ثواني لتوافق TIME
        morning_shift_end: formData.morning_shift_end + ':00',
        evening_shift_start: formData.evening_shift_start + ':00',
        evening_shift_end: formData.evening_shift_end + ':00',
        is_active: formData.is_active
      };

      if (isEditing && currentId) {
        const { error } = await supabase.from('clinics').update(payload).eq('id', currentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clinics').insert([payload]);
        if (error) throw error;
      }

      setFormData({
        clinic_name: '', clinic_number: '', control_password: '', screen_id: '',
        max_daily_appointments: '50', morning_shift_start: '08:00', morning_shift_end: '14:00',
        evening_shift_start: '14:00', evening_shift_end: '20:00', is_active: true
      });
      setIsEditing(false);
      setCurrentId(null);
      fetchData();
      alert('تم الحفظ بنجاح');
    } catch (error: any) {
      alert('خطأ: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف العيادة؟')) return;
    const { error } = await supabase.from('clinics').delete().eq('id', id);
    if (!error) fetchData(); else alert('لا يمكن الحذف');
  };

  const handleEdit = (clinic: any) => {
    setIsEditing(true);
    setCurrentId(clinic.id);
    setFormData({
      clinic_name: clinic.clinic_name,
      clinic_number: clinic.clinic_number.toString(),
      control_password: clinic.control_password,
      screen_id: clinic.screen_id || '',
      max_daily_appointments: clinic.max_daily_appointments.toString(),
      // قص الثواني للعرض في input type="time"
      morning_shift_start: clinic.morning_shift_start?.substring(0, 5) || '08:00',
      morning_shift_end: clinic.morning_shift_end?.substring(0, 5) || '14:00',
      evening_shift_start: clinic.evening_shift_start?.substring(0, 5) || '14:00',
      evening_shift_end: clinic.evening_shift_end?.substring(0, 5) || '20:00',
      is_active: clinic.is_active
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-cairo" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Activity className="text-blue-600"/> إعدادات العيادات
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="اسم العيادة" value={formData.clinic_name} onChange={e => setFormData({...formData, clinic_name: e.target.value})} className="border p-2 rounded" required />
          <input type="number" placeholder="رقم العيادة" value={formData.clinic_number} onChange={e => setFormData({...formData, clinic_number: e.target.value})} className="border p-2 rounded" required />
          <input placeholder="كلمة مرور التحكم" value={formData.control_password} onChange={e => setFormData({...formData, control_password: e.target.value})} className="border p-2 rounded" required />
          
          <select value={formData.screen_id} onChange={e => setFormData({...formData, screen_id: e.target.value})} className="border p-2 rounded">
            <option value="">-- اختر الشاشة --</option>
            {screens.map(s => <option key={s.id} value={s.id}>شاشة رقم {s.screen_number}</option>)}
          </select>

          <input type="number" placeholder="الحد الأقصى للحجز" value={formData.max_daily_appointments} onChange={e => setFormData({...formData, max_daily_appointments: e.target.value})} className="border p-2 rounded" />
          
          <div className="flex gap-2 items-center">
            <label className="text-xs">صباحي من</label>
            <input type="time" value={formData.morning_shift_start} onChange={e => setFormData({...formData, morning_shift_start: e.target.value})} className="border p-1 rounded text-xs flex-1" />
            <label className="text-xs">إلى</label>
            <input type="time" value={formData.morning_shift_end} onChange={e => setFormData({...formData, morning_shift_end: e.target.value})} className="border p-1 rounded text-xs flex-1" />
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-xs">مسائي من</label>
            <input type="time" value={formData.evening_shift_start} onChange={e => setFormData({...formData, evening_shift_start: e.target.value})} className="border p-1 rounded text-xs flex-1" />
            <label className="text-xs">إلى</label>
            <input type="time" value={formData.evening_shift_end} onChange={e => setFormData({...formData, evening_shift_end: e.target.value})} className="border p-1 rounded text-xs flex-1" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5" />
            <label>العيادة مفعلة</label>
          </div>

          <div className="md:col-span-3 flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded flex-1">{isEditing ? 'تحديث البيانات' : 'إضافة عيادة'}</button>
            {isEditing && <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 rounded">إلغاء</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-right min-w-[800px]">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">رقم</th>
              <th className="p-4">الشاشة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">تحكم</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => (
              <tr key={clinic.id} className="border-t">
                <td className="p-4 font-bold">{clinic.clinic_name}</td>
                <td className="p-4">{clinic.clinic_number}</td>
                <td className="p-4">{clinic.screens?.screen_number || '-'}</td>
                <td className="p-4">{clinic.is_active ? '✅' : '❌'}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(clinic)} className="text-blue-600"><Edit/></button>
                  <button onClick={() => handleDelete(clinic.id)} className="text-red-600"><Trash2/></button>
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

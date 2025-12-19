'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// أيقونة Stethoscope بدلاً من UserMd
import { Trash2, Edit, Save, X, Stethoscope, Search } from 'lucide-react';

export default function DoctorsSettings() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Initial State matching Database Columns
  const initialFormState = {
    full_name: '',
    doctor_number: '',
    code: '', // New field
    specialization: '',
    phone: '',
    national_id: '',
    email: '',
    clinic_id: '',
    work_days: '',
    shift: 'morning',
    work_status: 'active',
    check_in_time: '',
    check_out_time: '',
    annual_leave_balance: '30',
    emergency_leave_balance: '10',
    absence_days: '0',
    password_hash: '', // Optional in UI
    image_url: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // 2. Fetch Data
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

  // 3. Save Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare payload with correct types
      const payload: any = {
        ...formData,
        clinic_id: formData.clinic_id || null,
        annual_leave_balance: parseInt(formData.annual_leave_balance) || 0,
        emergency_leave_balance: parseInt(formData.emergency_leave_balance) || 0,
        absence_days: parseInt(formData.absence_days) || 0,
        // Convert Time inputs to Timestamps or Time strings if needed
        // Assuming database expects TIMESTAMP or TIME, we send ISO string or time string
        // If DB is TIMESTAMP:
        check_in_time: formData.check_in_time ? new Date(`1970-01-01T${formData.check_in_time}`).toISOString() : null,
        check_out_time: formData.check_out_time ? new Date(`1970-01-01T${formData.check_out_time}`).toISOString() : null,
      };

      // Remove empty optional fields to avoid errors if any
      if (!payload.password_hash) delete payload.password_hash;

      if (isEditing && currentId) {
        const { error } = await supabase.from('doctors').update(payload).eq('id', currentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('doctors').insert([payload]);
        if (error) throw error;
      }

      setFormData(initialFormState);
      setIsEditing(false);
      setCurrentId(null);
      fetchData();
      alert('تم الحفظ بنجاح');
    } catch (error: any) {
      alert('خطأ: ' + error.message);
    }
  };

  // 4. Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الطبيب؟')) return;
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (!error) fetchData(); else alert('خطأ في الحذف');
  };

  // 5. Edit Handler
  const handleEdit = (doc: any) => {
    setIsEditing(true);
    setCurrentId(doc.id);
    
    // Helper to extract time HH:MM from ISO/Timestamp
    const extractTime = (isoString: string) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toTimeString().slice(0, 5);
    };

    setFormData({
      full_name: doc.full_name || '',
      doctor_number: doc.doctor_number || '',
      code: doc.code || '',
      specialization: doc.specialization || '',
      phone: doc.phone || '',
      national_id: doc.national_id || '',
      email: doc.email || '',
      clinic_id: doc.clinic_id || '',
      work_days: doc.work_days || '',
      shift: doc.shift || 'morning',
      work_status: doc.work_status || 'active',
      check_in_time: extractTime(doc.check_in_time),
      check_out_time: extractTime(doc.check_out_time),
      annual_leave_balance: doc.annual_leave_balance?.toString() || '30',
      emergency_leave_balance: doc.emergency_leave_balance?.toString() || '10',
      absence_days: doc.absence_days?.toString() || '0',
      password_hash: '', // Don't show hash
      image_url: doc.image_url || '',
      notes: doc.notes || ''
    });
  };

  // Filter
  const filteredDoctors = doctors.filter(d => d.full_name.includes(searchTerm) || d.doctor_number.includes(searchTerm));

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-cairo" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Stethoscope className="text-blue-600"/> إدارة الأطباء
      </h1>

      {/* Form Container */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold mb-4 text-slate-700">{isEditing ? 'تعديل بيانات طبيب' : 'إضافة طبيب جديد'}</h2>
        
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Basic Info */}
          <input placeholder="الاسم الكامل" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="border p-2 rounded" required />
          <input placeholder="كود الطبيب (Doctor No)" value={formData.doctor_number} onChange={e => setFormData({...formData, doctor_number: e.target.value})} className="border p-2 rounded" required />
          <input placeholder="رمز الدخول (Code - 4 digits)" maxLength={4} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="border p-2 rounded font-mono" required />
          <input placeholder="التخصص" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="border p-2 rounded" required />
          
          {/* Contact & ID */}
          <input placeholder="رقم الهاتف" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border p-2 rounded" />
          <input placeholder="الرقم القومي" value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} className="border p-2 rounded" />
          <input placeholder="البريد الإلكتروني" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border p-2 rounded" />
          
          {/* Job Details */}
          <select value={formData.clinic_id} onChange={e => setFormData({...formData, clinic_id: e.target.value})} className="border p-2 rounded">
            <option value="">-- العيادة --</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
          </select>

          <input placeholder="أيام العمل (سبت، أحد...)" value={formData.work_days} onChange={e => setFormData({...formData, work_days: e.target.value})} className="border p-2 rounded" />
          
          <select value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} className="border p-2 rounded">
            <option value="morning">صباحي</option>
            <option value="evening">مسائي</option>
          </select>

          <select value={formData.work_status} onChange={e => setFormData({...formData, work_status: e.target.value})} className="border p-2 rounded">
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="vacation">إجازة</option>
          </select>

          {/* Time & Balances */}
          <div className="flex gap-2 items-center border p-2 rounded bg-slate-50">
            <label className="text-xs shrink-0">حضور:</label>
            <input type="time" value={formData.check_in_time} onChange={e => setFormData({...formData, check_in_time: e.target.value})} className="bg-transparent outline-none w-full" />
          </div>
          <div className="flex gap-2 items-center border p-2 rounded bg-slate-50">
            <label className="text-xs shrink-0">انصراف:</label>
            <input type="time" value={formData.check_out_time} onChange={e => setFormData({...formData, check_out_time: e.target.value})} className="bg-transparent outline-none w-full" />
          </div>

          <input type="number" placeholder="رصيد سنوي" value={formData.annual_leave_balance} onChange={e => setFormData({...formData, annual_leave_balance: e.target.value})} className="border p-2 rounded" />
          <input type="number" placeholder="رصيد عارضة" value={formData.emergency_leave_balance} onChange={e => setFormData({...formData, emergency_leave_balance: e.target.value})} className="border p-2 rounded" />
          <input type="number" placeholder="أيام غياب" value={formData.absence_days} onChange={e => setFormData({...formData, absence_days: e.target.value})} className="border p-2 rounded" />

          {/* Extra */}
          <input placeholder="رابط الصورة (URL)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="border p-2 rounded lg:col-span-2" />
          <textarea placeholder="ملاحظات..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="border p-2 rounded lg:col-span-2" rows={1}></textarea>
          
          {/* Actions */}
          <div className="lg:col-span-4 flex gap-2 mt-4 pt-4 border-t">
            <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Save size={18}/> {isEditing ? 'تحديث البيانات' : 'حفظ الطبيب'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setFormData(initialFormState); }} className="bg-gray-500 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-gray-600 transition-colors">
                <X size={18}/> إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-2">
           <Search className="text-slate-400"/>
           <input 
             placeholder="بحث باسم الطبيب أو الكود..." 
             className="flex-1 outline-none"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-600 text-sm font-bold">
              <tr>
                <th className="p-4">الاسم</th>
                <th className="p-4">التخصص</th>
                <th className="p-4">العيادة</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">الكود</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">تحكم</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{doc.full_name}</td>
                  <td className="p-4 text-slate-600">{doc.specialization}</td>
                  <td className="p-4 text-blue-600">{doc.clinics?.clinic_name || '-'}</td>
                  <td className="p-4 font-mono">{doc.phone}</td>
                  <td className="p-4 font-mono bg-slate-100 rounded w-fit px-2">{doc.code}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${doc.work_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {doc.work_status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleEdit(doc)} className="text-blue-600 hover:bg-blue-100 p-2 rounded transition-colors"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:bg-red-100 p-2 rounded transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <p className="p-8 text-center text-slate-500">جاري تحميل البيانات...</p>}
      </div>
    </div>
  );
}

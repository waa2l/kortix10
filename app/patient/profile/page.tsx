'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Save, Activity, AlertTriangle, FileText } from 'lucide-react';

export default function PatientProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // نموذج البيانات يطابق أعمدة الجدول patients
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: 'male',
    weight_kg: '',
    height_cm: '',
    blood_pressure: '',
    chronic_diseases: '',
    drug_allergies: false,
    allergy_details: '',
    previous_surgeries: false,
    surgery_details: '',
    current_medications: false,
    medication_details: '',
    is_pregnant: false // للنساء فقط
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase.from('patients').select('*').eq('user_id', user.id).single();
    if (data) {
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        gender: data.gender || 'male',
        weight_kg: data.weight_kg || '',
        height_cm: data.height_cm || '',
        blood_pressure: data.blood_pressure || '',
        chronic_diseases: data.chronic_diseases || '',
        drug_allergies: data.drug_allergies || false,
        allergy_details: data.allergy_details || '',
        previous_surgeries: data.previous_surgeries || false,
        surgery_details: data.surgery_details || '',
        current_medications: data.current_medications || false,
        medication_details: data.medication_details || '',
        is_pregnant: data.is_pregnant || false
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // تحديث البيانات
    const { error } = await supabase.from('patients').update({
      ...formData,
      // تحويل الأرقام
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg as string) : null,
      height_cm: formData.height_cm ? parseFloat(formData.height_cm as string) : null,
    }).eq('user_id', user?.id);

    if (!error) alert('تم حفظ الملف الشخصي بنجاح ✅');
    else alert('حدث خطأ أثناء الحفظ');
    
    setSaving(false);
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <User className="w-6 h-6 text-blue-600"/> ملفي الشخصي والطبي
      </h1>

      {/* البيانات الأساسية */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 border-b pb-2">1. البيانات الأساسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">الاسم رباعي</label>
            <input className="w-full p-2 border rounded-lg" value={formData.full_name} onChange={e=>setFormData({...formData, full_name:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">رقم الهاتف</label>
            <input className="w-full p-2 border rounded-lg" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">النوع</label>
            <select className="w-full p-2 border rounded-lg" value={formData.gender} onChange={e=>setFormData({...formData, gender:e.target.value})}>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          {formData.gender === 'female' && (
             <div className="flex items-center gap-2 mt-6">
               <input type="checkbox" id="preg" checked={formData.is_pregnant} onChange={e=>setFormData({...formData, is_pregnant:e.target.checked})} className="w-5 h-5"/>
               <label htmlFor="preg" className="font-bold text-pink-600">هل يوجد حمل حالياً؟</label>
             </div>
          )}
        </div>
      </div>

      {/* القياسات الحيوية */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500"/> 2. القياسات الحيوية</h3>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="text-sm font-bold block">الوزن (kg)</label><input type="number" className="w-full p-2 border rounded" value={formData.weight_kg} onChange={e=>setFormData({...formData, weight_kg:e.target.value})}/></div>
          <div><label className="text-sm font-bold block">الطول (cm)</label><input type="number" className="w-full p-2 border rounded" value={formData.height_cm} onChange={e=>setFormData({...formData, height_cm:e.target.value})}/></div>
          <div><label className="text-sm font-bold block">ضغط الدم المعتاد</label><input type="text" placeholder="120/80" className="w-full p-2 border rounded" value={formData.blood_pressure} onChange={e=>setFormData({...formData, blood_pressure:e.target.value})}/></div>
        </div>
      </div>

      {/* التاريخ المرضي */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500"/> 3. التاريخ المرضي (هام جداً)</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">أمراض مزمنة (سكر، ضغط، قلب...)</label>
            <textarea className="w-full p-2 border rounded h-20" placeholder="اكتب لا يوجد إذا كنت سليماً" value={formData.chronic_diseases} onChange={e=>setFormData({...formData, chronic_diseases:e.target.value})}></textarea>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
             <div className="flex items-center gap-2">
                <input type="checkbox" id="allergy" checked={formData.drug_allergies} onChange={e=>setFormData({...formData, drug_allergies:e.target.checked})} className="w-5 h-5 accent-red-600"/>
                <label htmlFor="allergy" className="font-bold text-slate-800">هل لديك حساسية من أي دواء؟</label>
             </div>
             {formData.drug_allergies && (
               <input className="w-full p-2 border border-red-200 bg-red-50 rounded" placeholder="اذكر أسماء الأدوية المسببة للحساسية..." value={formData.allergy_details} onChange={e=>setFormData({...formData, allergy_details:e.target.value})}/>
             )}
          </div>

          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
             <div className="flex items-center gap-2">
                <input type="checkbox" id="meds" checked={formData.current_medications} onChange={e=>setFormData({...formData, current_medications:e.target.checked})} className="w-5 h-5 accent-blue-600"/>
                <label htmlFor="meds" className="font-bold text-slate-800">هل تتناول أدوية بانتظام حالياً؟</label>
             </div>
             {formData.current_medications && (
               <input className="w-full p-2 border border-blue-200 bg-white rounded" placeholder="اذكر أسماء الأدوية..." value={formData.medication_details} onChange={e=>setFormData({...formData, medication_details:e.target.value})}/>
             )}
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2">
        {saving ? 'جاري الحفظ...' : <><Save className="w-6 h-6"/> حفظ البيانات</>}
      </button>

    </div>
  );
}

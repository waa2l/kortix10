'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit, Save, X, Monitor } from 'lucide-react';

export default function ScreensSettings() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    screen_name: '', // حقل جديد
    screen_number: '',
    password: '',
    is_active: true
  });

  const fetchScreens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .order('screen_number', { ascending: true });
      
      if (error) throw error;
      setScreens(data || []);
    } catch (error) {
      console.error('Error fetching screens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScreens(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.screen_number || !formData.password || !formData.screen_name) return alert('يرجى ملء كافة البيانات');

    try {
      const payload = {
        screen_name: formData.screen_name,
        screen_number: parseInt(formData.screen_number),
        password: formData.password,
        is_active: formData.is_active
      };

      if (isEditing && currentId) {
        const { error } = await supabase.from('screens').update(payload).eq('id', currentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('screens').insert([payload]);
        if (error) throw error;
      }

      setFormData({ screen_name: '', screen_number: '', password: '', is_active: true });
      setIsEditing(false);
      setCurrentId(null);
      fetchScreens();
      alert('تم الحفظ بنجاح');
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    const { error } = await supabase.from('screens').delete().eq('id', id);
    if (!error) fetchScreens(); else alert('لا يمكن الحذف');
  };

  const handleEdit = (screen: any) => {
    setIsEditing(true);
    setCurrentId(screen.id);
    setFormData({
      screen_name: screen.screen_name || '',
      screen_number: screen.screen_number.toString(),
      password: screen.password,
      is_active: screen.is_active
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-cairo" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Monitor className="text-blue-600"/> إعدادات الشاشات
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold mb-4">{isEditing ? 'تعديل شاشة' : 'إضافة شاشة جديدة'}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-600 mb-1">اسم الشاشة (مثال: الاستقبال الرئيسية)</label>
            <input type="text" value={formData.screen_name} onChange={(e) => setFormData({...formData, screen_name: e.target.value})} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">رقم الشاشة</label>
            <input type="number" value={formData.screen_number} onChange={(e) => setFormData({...formData, screen_number: e.target.value})} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">كلمة المرور</label>
            <input type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border rounded p-2" required />
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Save size={18} /> {isEditing ? 'تحديث' : 'حفظ'}
            </button>
            {isEditing && <button type="button" onClick={() => { setIsEditing(false); setFormData({ screen_name: '', screen_number: '', password: '', is_active: true }); }} className="bg-gray-500 text-white px-4 rounded"><X size={18} /></button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">الرقم</th>
              <th className="p-4">كلمة المرور</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {screens.map((screen) => (
              <tr key={screen.id} className="border-t hover:bg-slate-50">
                <td className="p-4 font-bold">{screen.screen_name}</td>
                <td className="p-4 badge badge-neutral">{screen.screen_number}</td>
                <td className="p-4 text-slate-600">{screen.password}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(screen)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(screen.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

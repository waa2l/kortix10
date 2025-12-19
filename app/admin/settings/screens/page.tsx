'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit, Plus, Save, X, Monitor } from 'lucide-react';

export default function ScreensSettings() {
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // النموذج يطابق قاعدة البيانات
  const [formData, setFormData] = useState({
    screen_number: '',
    password: '',
    is_active: true
  });

  // جلب البيانات
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

  useEffect(() => {
    fetchScreens();
  }, []);

  // الحفظ (إضافة أو تعديل)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.screen_number || !formData.password) return alert('يرجى ملء كافة البيانات');

    try {
      const payload = {
        screen_number: parseInt(formData.screen_number), // تحويل لرقم
        password: formData.password,
        is_active: formData.is_active
      };

      if (isEditing && currentId) {
        // تعديل
        const { error } = await supabase.from('screens').update(payload).eq('id', currentId);
        if (error) throw error;
      } else {
        // إضافة جديد
        const { error } = await supabase.from('screens').insert([payload]);
        if (error) throw error;
      }

      // إعادة تعيين النموذج وتحديث البيانات
      setFormData({ screen_number: '', password: '', is_active: true });
      setIsEditing(false);
      setCurrentId(null);
      fetchScreens();
      alert('تم الحفظ بنجاح');

    } catch (error: any) {
      alert('حدث خطأ: ' + error.message);
    }
  };

  // الحذف
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشاشة؟')) return;
    try {
      const { error } = await supabase.from('screens').delete().eq('id', id);
      if (error) throw error;
      fetchScreens();
    } catch (error: any) {
      alert('لا يمكن الحذف (قد تكون مرتبطة بعيادات)');
    }
  };

  // تعبئة النموذج للتعديل
  const handleEdit = (screen: any) => {
    setIsEditing(true);
    setCurrentId(screen.id);
    setFormData({
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

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold mb-4">{isEditing ? 'تعديل شاشة' : 'إضافة شاشة جديدة'}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-slate-600 mb-1">رقم الشاشة</label>
            <input 
              type="number" 
              value={formData.screen_number}
              onChange={(e) => setFormData({...formData, screen_number: e.target.value})}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">كلمة المرور (للدخول)</label>
            <input 
              type="text" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div className="flex items-center gap-2 h-10">
            <input 
              type="checkbox" 
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 accent-blue-600"
            />
            <label>شاشة نشطة</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
              <Save size={18} /> {isEditing ? 'تحديث' : 'حفظ'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setFormData({ screen_number: '', password: '', is_active: true }); }} className="bg-gray-500 text-white px-4 rounded">
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">رقم الشاشة</th>
              <th className="p-4">كلمة المرور</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {screens.map((screen) => (
              <tr key={screen.id} className="border-t hover:bg-slate-50">
                <td className="p-4 font-bold">{screen.screen_number}</td>
                <td className="p-4 text-slate-600">{screen.password}</td>
                <td className="p-4">
                  {screen.is_active 
                    ? <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">نشطة</span> 
                    : <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">متوقفة</span>}
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(screen)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(screen.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-center text-slate-500">جاري التحميل...</p>}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';

export default function DoctorProfile() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    doctor_number: '',
    phone: '',
    email: '',
    current_password: '', // For verification (Optional logic)
    new_password: ''
  });

  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctorData');
    if (storedDoctor) {
      const { id } = JSON.parse(storedDoctor);
      setDoctorId(id);
      fetchProfile(id);
    }
  }, []);

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('doctors').select('*').eq('id', id).single();
      if (error) throw error;
      
      setFormData({
        full_name: data.full_name,
        specialization: data.specialization,
        doctor_number: data.doctor_number,
        phone: data.phone || '',
        email: data.email || '',
        current_password: '',
        new_password: ''
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;

    try {
      // Update basic info
      const updates: any = {
        phone: formData.phone,
        email: formData.email
      };

      // Only update password if provided
      if (formData.new_password) {
        // In a real app, verify old password here
        // updates.password_hash = hash(formData.new_password) // You need a hashing logic or simple string for demo
        // For this demo assuming simple string or handled by backend auth
        alert('تنبيه: تغيير كلمة المرور يتطلب التواصل مع الإدارة في هذا الإصدار التجريبي');
      }

      const { error } = await supabase.from('doctors').update(updates).eq('id', doctorId);
      if (error) throw error;
      
      alert('تم تحديث البيانات بنجاح');
    } catch (error: any) {
      alert('خطأ: ' + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6 font-cairo max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <User className="w-6 h-6 text-blue-600"/> الملف الشخصي
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        
        {/* Read-Only Info */}
        <div className="bg-slate-50 p-6 rounded-xl mb-8 border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{formData.full_name}</h2>
              <p className="text-slate-500">{formData.specialization}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block">كود الطبيب</span>
              <span className="font-mono font-bold text-slate-700">{formData.doctor_number}</span>
            </div>
            <div>
              <span className="text-slate-400 block">حالة العمل</span>
              <span className="font-bold text-green-600">Active</span>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500"/> رقم الهاتف
            </label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500"/> البريد الإلكتروني
            </label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500"/> الأمان
            </h3>
            
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="كلمة المرور الجديدة (اتركها فارغة لعدم التغيير)"
                value={formData.new_password}
                onChange={e => setFormData({...formData, new_password: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-transform active:scale-95 flex justify-center items-center gap-2">
            <Save className="w-5 h-5" /> حفظ التغييرات
          </button>

        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle, AlertCircle, Bell, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PatientInbox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // جلب معرف المريض
    const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single();
    if (!patient) return;

    // جلب الرسائل
    const { data } = await supabase
      .from('patient_inbox')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    if (data) setMessages(data);
    setLoading(false);
  };

  const markAsRead = async (msgId: string, link?: string) => {
    // تحديث الحالة لمقروء
    await supabase.from('patient_inbox').update({ is_read: true }).eq('id', msgId);
    
    // تحديث الواجهة محلياً
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_read: true } : m));

    // التوجيه لو وجد رابط (مثلاً لصفحة الاستشارة)
    if (link) router.push(link);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل الرسائل...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Mail className="w-6 h-6 text-blue-600"/> صندوق الوارد
      </h1>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-slate-200">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3"/>
            <p className="text-slate-500">لا توجد رسائل جديدة</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              onClick={() => markAsRead(msg.id, msg.action_link)}
              className={`p-5 rounded-xl border transition cursor-pointer flex gap-4 items-start ${
                msg.is_read ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200 shadow-sm'
              }`}
            >
              <div className={`mt-1 p-2 rounded-full shrink-0 ${
                msg.message_type === 'alert' ? 'bg-red-100 text-red-600' :
                msg.message_type === 'success' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {msg.message_type === 'alert' ? <AlertCircle className="w-5 h-5"/> : 
                 msg.message_type === 'success' ? <CheckCircle className="w-5 h-5"/> : 
                 <Bell className="w-5 h-5"/>}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold text-lg ${msg.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {msg.title}
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3"/> {new Date(msg.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 text-sm leading-relaxed">{msg.message_body}</p>
                {!msg.is_read && <span className="inline-block mt-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">جديد</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

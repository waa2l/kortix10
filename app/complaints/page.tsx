'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  MessageSquare, User, Phone, Mail, Send, 
  CheckCircle, AlertCircle, ArrowRight, FileText 
} from 'lucide-react';

export default function ComplaintsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    complaint_type: 'complaint', // Default value
    complaint_text: '',
    additional_notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.complaint_text) {
        throw new Error('يرجى كتابة تفاصيل الشكوى أو المقترح');
      }

      const { error: insertError } = await supabase
        .from('complaints')
        .insert([
          {
            patient_name: formData.patient_name,
            patient_phone: formData.patient_phone,
            patient_email: formData.patient_email,
            complaint_type: formData.complaint_type,
            complaint_text: formData.complaint_text,
            additional_notes: formData.additional_notes,
            status: 'pending' // Default status based on your SQL
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        patient_name: '',
        patient_phone: '',
        patient_email: '',
        complaint_type: 'complaint',
        complaint_text: '',
        additional_notes: ''
      });

    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 font-cairo" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">تم الإرسال بنجاح</h2>
          <p className="text-slate-500 mb-8">نشكرك على تواصلك معنا. سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setSuccess(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
            >
              إرسال طلب جديد
            </button>
            <Link href="/" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-cairo" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-slate-800">الشكاوى والمقترحات</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">نحن هنا للاستماع إليك</h2>
            <p className="text-slate-500 mt-2">رأيك يهمنا ويساعدنا على تحسين خدماتنا</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* نوع الطلب */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">نوع الرسالة</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'complaint', label: 'شكوى' },
                  { id: 'suggestion', label: 'اقتراح' },
                  { id: 'inquiry', label: 'استفسار' },
                  { id: 'other', label: 'أخرى' }
                ].map((type) => (
                  <label key={type.id} className={`
                    cursor-pointer text-center py-3 px-4 rounded-xl border-2 transition-all font-bold text-sm
                    ${formData.complaint_type === type.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'}
                  `}>
                    <input 
                      type="radio" 
                      name="complaint_type" 
                      value={type.id} 
                      checked={formData.complaint_type === type.id}
                      onChange={handleChange}
                      className="hidden" 
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* الاسم */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الاسم بالكامل (اختياري)</label>
                <div className="relative">
                  <User className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="patient_name"
                    value={formData.patient_name}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="اسمك الكريم"
                  />
                </div>
              </div>

              {/* الهاتف */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف (للتواصل)</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" 
                    name="patient_phone"
                    value={formData.patient_phone}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني (اختياري)</label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="patient_email"
                  value={formData.patient_email}
                  onChange={handleChange}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* نص الشكوى */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">تفاصيل الرسالة <span className="text-red-500">*</span></label>
              <div className="relative">
                <textarea 
                  name="complaint_text"
                  value={formData.complaint_text}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                  placeholder="اكتب تفاصيل شكواك أو اقتراحك هنا..."
                ></textarea>
              </div>
            </div>

            {/* ملاحظات إضافية */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات إضافية</label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                <textarea 
                  name="additional_notes"
                  value={formData.additional_notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                  placeholder="أي تفاصيل أخرى تود إضافتها..."
                ></textarea>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>جاري الإرسال...</>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  إرسال الطلب
                </>
              )}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}

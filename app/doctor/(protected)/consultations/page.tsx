'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Stethoscope, Clock, AlertTriangle, User, ArrowRight, ArrowLeft, 
  Send, X, Share2, MessageSquare, Plus, Trash2, CheckCircle, Printer,
  Activity, FileText, AlertOctagon, Baby, History, Inbox
} from 'lucide-react';
import { PrescriptionView } from '@/components/PrescriptionView'; 

// --- Types ---
type PatientData = {
  full_name: string;
  gender: string;
  weight_kg?: number;
  height_cm?: number;
  // ... باقي الحقول كما هي
};

type Consultation = {
  id: string;
  specialization: string;
  status: string;
  created_at: string;
  complaint_text: string;
  transfer_note?: string; // الحقل الجديد
  patient?: PatientData;
};

// ... (نفس دالة getTimeElapsed السابقة) ...
const getTimeElapsed = (dateString: string) => {
  const diff = new Date().getTime() - new Date(dateString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  return 'منذ أقل من ساعة';
};

export default function DoctorConsultationsPage() {
  // بيانات الطبيب الحالي
  const [currentDoctor, setCurrentDoctor] = useState<{id: string, full_name: string, specialization: string} | null>(null);
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  
  // نظام التبويبات (جديد)
  const [activeTab, setActiveTab] = useState<'inbox' | 'history'>('inbox');
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'reply'>('list');

  // القوائم
  const [diagnosesList, setDiagnosesList] = useState<any[]>([]);
  const [testsList, setTestsList] = useState<any[]>([]);
  const [imagingList, setImagingList] = useState<any[]>([]);
  const [medicinesList, setMedicinesList] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // فورم الرد
  const [step, setStep] = useState(1);
  const [replyData, setReplyData] = useState({
    diagnosis: '', selectedTests: [] as string[], selectedImaging: [] as string[], prescriptions: [] as any[], healthMessages: [] as string[], followUpDate: '', notes: ''
  });
  const [tempMed, setTempMed] = useState({ name: '', form: '', concentration: '', frequency: '', duration: '', relation: '', timing: '', notes: '' });

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => { if (printRef.current) { const original = document.body.innerHTML; document.body.innerHTML = printRef.current.outerHTML; window.print(); window.location.reload(); } };

  // --- 1. جلب بيانات الطبيب أولاً ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // نفترض أن جدول doctors مرتبط بـ auth.users عبر id أو email
        const { data: doc } = await supabase.from('doctors').select('*').eq('email', user.email).single();
        if (doc) {
          setCurrentDoctor(doc);
        }
      }
    };
    init();
    fetchLists();
    fetchSettings();
  }, []);

  // --- 2. جلب الاستشارات بناءً على التبويب وتخصص الطبيب ---
  useEffect(() => {
    if (currentDoctor) {
      fetchConsultations();
    }
  }, [currentDoctor, activeTab]);

  const fetchConsultations = async () => {
    setLoading(true);
    let query = supabase
      .from('consultations')
      .select('*, patient:patients(*)');

    if (activeTab === 'inbox') {
      // البريد الوارد: استشارات مفتوحة + تتبع تخصص الطبيب
      query = query
        .eq('status', 'open')
        .eq('specialization', currentDoctor?.specialization); 
    } else {
      // الأرشيف: استشارات قام هذا الطبيب بالرد عليها (مغلقة)
      // ملاحظة: يجب التأكد من أن doctor_id يتم تحديثه عند الرد
      query = query
        .eq('status', 'completed')
        .eq('doctor_id', currentDoctor?.id);
    }

    const { data } = await query.order('created_at', { ascending: false });
    if (data) setConsultations(data);
    setLoading(false);
  };

  // ... (نفس دوال fetchLists و fetchSettings السابقة)
  const fetchLists = async () => { /* ... كود الجلب السابق ... */ };
  const fetchSettings = async () => {
    const { data } = await supabase.from('system_settings').select('specializations').single();
    if (data && data.specializations) setAvailableSpecializations(data.specializations.split(','));
  };

  // --- Actions ---
  const handleOpenConsultation = (consultation: Consultation) => { setSelectedConsultation(consultation); setViewMode('details'); };
  
  const handleSkip = () => {
    setConsultations(prev => prev.filter(c => c.id !== selectedConsultation?.id));
    setSelectedConsultation(null); setViewMode('list'); setShowTransferModal(false);
  };

  // --- منطق التحويل الجديد ---
  const handleTransfer = async (targetSpec: string) => {
    if (!selectedConsultation || !currentDoctor) return;

    const note = `تم التحويل من تخصص ${currentDoctor.specialization} بواسطة د. ${currentDoctor.full_name}`;

    const { error } = await supabase.from('consultations')
      .update({ 
        specialization: targetSpec,
        transfer_note: note // تسجيل الملاحظة
      })
      .eq('id', selectedConsultation.id);
    
    if (!error) {
      alert(`تم تحويل الاستشارة بنجاح إلى ${targetSpec}`);
      handleSkip();
    } else {
      alert('حدث خطأ');
    }
  };

  // ... (نفس دالة handleReport, startReply, addMedicine, removeMedicine)

  const handleSubmitReply = async () => {
    if(!selectedConsultation || !currentDoctor) return;

    const { error } = await supabase.from('consultations').update({
       status: 'completed',
       doctor_id: currentDoctor.id, // تسجيل من قام بالرد
       response_text: `التشخيص: ${replyData.diagnosis} \n\nملاحظات: ${replyData.notes}`,
       medicines: JSON.stringify(replyData.prescriptions),
       tests: replyData.selectedTests.join(', '),
       imaging: replyData.selectedImaging.join(', '),
       health_messages: JSON.stringify(replyData.healthMessages),
    }).eq('id', selectedConsultation.id);

    if(!error) {
       alert('تم إرسال الرد بنجاح');
       handleSkip();
    } else { alert('حدث خطأ'); }
  };

  // --- RENDER ---
  if (!currentDoctor) return <div className="flex h-screen items-center justify-center">جاري التحقق من بيانات الطبيب...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-cairo" dir="rtl">
      
      {/* Header & Tabs */}
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="text-blue-600"/> عيادة {currentDoctor.specialization}
            </h1>
            <p className="text-slate-500 text-sm">مرحباً د. {currentDoctor.full_name}</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-white w-fit p-1 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => { setActiveTab('inbox'); setViewMode('list'); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'inbox' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Inbox className="w-4 h-4"/> الاستشارات الواردة
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setViewMode('list'); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'history' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History className="w-4 h-4"/> أرشيف ردودي
          </button>
        </div>
      </header>

      {/* VIEW 1: LIST */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.length === 0 ? (
             <div className="col-span-full text-center py-20 text-slate-400">
               {activeTab === 'inbox' ? 'لا توجد استشارات جديدة في تخصصك' : 'لم تقم بالرد على أي استشارة بعد'}
             </div>
          ) : (
            consultations.map(consultation => (
              <div key={consultation.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer group relative overflow-hidden" onClick={() => handleOpenConsultation(consultation)}>
                {/* شريط التحويل المميز */}
                {consultation.transfer_note && (
                  <div className="bg-orange-100 text-orange-800 text-[10px] p-1 px-3 mb-3 rounded-full w-fit font-bold border border-orange-200 flex items-center gap-1">
                    <Share2 className="w-3 h-3"/> {consultation.transfer_note}
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeTab === 'inbox' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                    {activeTab === 'inbox' ? 'واردة' : 'تم الرد'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3"/> {getTimeElapsed(consultation.created_at)}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">
                   {consultation.complaint_text.substring(0, 50)}...
                </h3>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                   <span className="text-xs text-slate-500 font-bold">{consultation.patient?.full_name || 'مجهول'}</span>
                   <button className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-[-5px] transition-transform">
                     {activeTab === 'inbox' ? 'فتح ورد' : 'عرض الروشتة'} <ArrowLeft className="w-4 h-4"/>
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2 & 3 (Details & Reply): نفس الكود السابق ولكن تأكد من إضافة زر التحويل فقط في حالة Inbox */}
      {viewMode === 'details' && selectedConsultation && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
           {/* ... (نفس الهيدر والتفاصيل السابقة) ... */}
           <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div><h2 className="text-xl font-bold">تفاصيل الاستشارة</h2></div>
              <button onClick={() => setViewMode('list')} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X className="w-5 h-5"/></button>
           </div>
           
           <div className="p-8">
              {/* عرض الملاحظة إذا كانت محولة */}
              {selectedConsultation.transfer_note && (
                 <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-xl mb-6 font-bold text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4"/> {selectedConsultation.transfer_note}
                 </div>
              )}

              {/* ... (عرض ملف المريض والشكوى - نفس الكود السابق) ... */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
                 <p className="text-sm text-slate-500 mb-1 font-bold">الشكوى:</p>
                 <p className="text-lg font-medium text-slate-800 whitespace-pre-line">{selectedConsultation.complaint_text}</p>
              </div>

              {/* أزرار التحكم تظهر فقط لو الاستشارة مفتوحة */}
              {activeTab === 'inbox' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                   <button onClick={() => { setStep(1); setViewMode('reply'); }} className="col-span-2 md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition"><MessageSquare className="w-5 h-5"/> الرد</button>
                   <button onClick={() => setShowTransferModal(true)} className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition"><Share2 className="w-5 h-5"/> تحويل</button>
                   {/* ... باقي الأزرار */}
                </div>
              ) : (
                <div className="text-center mt-8">
                   <p className="text-green-600 font-bold mb-4">تم الرد على هذه الاستشارة</p>
                   {/* هنا ممكن تعرض الروشتة مباشرة للعرض فقط */}
                </div>
              )}
           </div>

           {/* Transfer Modal - نفس الكود السابق */}
           {showTransferModal && (
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white p-6 rounded-2xl w-full max-w-sm animate-in zoom-in-95">
                 <h3 className="font-bold text-lg mb-4 text-center">تحويل الاستشارة</h3>
                 <div className="space-y-2 max-h-60 overflow-y-auto">
                   {availableSpecializations.filter(s => s !== currentDoctor.specialization).map((spec) => (
                     <button key={spec} onClick={() => handleTransfer(spec.trim())} className="w-full p-3 text-right bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl border border-transparent hover:border-purple-200 transition font-bold">{spec.trim()}</button>
                   ))}
                 </div>
                 <button onClick={() => setShowTransferModal(false)} className="w-full mt-4 p-2 text-slate-500 hover:bg-slate-100 rounded-lg">إلغاء</button>
               </div>
             </div>
           )}
        </div>
      )}

      {/* VIEW 3: REPLY WIZARD - نفس الكود السابق بالكامل */}
      {viewMode === 'reply' && (
         /* ... أنسخ كود الـ Wizard من الرد السابق هنا ... */
         <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <p>محتوى الرد (تم تنفيذه في الخطوة السابقة، يرجى دمجه هنا)</p>
            {/* لتوفير المساحة، استخدم نفس كود الرد السابق مع التأكد من استخدام currentDoctor.full_name في الروشتة */}
         </div>
      )}

    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Stethoscope, Clock, AlertTriangle, User, ArrowRight, ArrowLeft, 
  Send, X, Share2, MessageSquare, Plus, Trash2, CheckCircle, Printer // تمت إضافة Printer
} from 'lucide-react';
import { PrescriptionView } from '@/components/PrescriptionView'; 

// --- Types ---
type Consultation = {
  id: string;
  specialization: string;
  status: string;
  created_at: string;
  complaint_text: string;
  patient?: { full_name: string; gender: string; age: number };
};

// --- Helper for Time Ago ---
const getTimeElapsed = (dateString: string) => {
  const diff = new Date().getTime() - new Date(dateString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  return 'منذ أقل من ساعة';
};

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'reply'>('list');

  // --- Lists from DB ---
  const [diagnosesList, setDiagnosesList] = useState<any[]>([]);
  const [testsList, setTestsList] = useState<any[]>([]);
  const [imagingList, setImagingList] = useState<any[]>([]);
  const [medicinesList, setMedicinesList] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);

  // --- Reply Form State ---
  const [step, setStep] = useState(1);
  const [replyData, setReplyData] = useState({
    diagnosis: '',
    selectedTests: [] as string[],
    selectedImaging: [] as string[],
    prescriptions: [] as any[],
    healthMessages: [] as string[],
    followUpDate: '',
    notes: ''
  });

  // --- Temporary Medicine State ---
  const [tempMed, setTempMed] = useState({
    name: '', form: '', concentration: '', frequency: '', duration: '', relation: '', timing: '', notes: ''
  });

  // الطباعة
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    if (printRef.current) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printRef.current.outerHTML;
      window.print();
      // إعادة تحميل الصفحة لاستعادة الحالة الأصلية بعد الطباعة
      window.location.reload();
    }
  };

  // --- Initial Fetch ---
  useEffect(() => {
    fetchConsultations();
    fetchLists();
  }, []);

  const fetchConsultations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('consultations')
      .select('*, patient:patients(full_name, gender)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (data) setConsultations(data);
    setLoading(false);
  };

  const fetchLists = async () => {
    const [d, t, i, m, h] = await Promise.all([
      supabase.from('diagnoses').select('diagnosis_name'),
      supabase.from('tests').select('test_name'),
      supabase.from('imaging').select('imaging_name'),
      supabase.from('medicines').select('medicine_name'),
      supabase.from('health_messages').select('message_text'),
    ]);
    
    if(d.data) setDiagnosesList(d.data);
    if(t.data) setTestsList(t.data);
    if(i.data) setImagingList(i.data);
    if(m.data) setMedicinesList(m.data);
    if(h.data) setMessagesList(h.data);
  };

  // --- Actions ---
  const handleOpenConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setViewMode('details');
  };

  const handleSkip = () => {
    setConsultations(prev => prev.filter(c => c.id !== selectedConsultation?.id));
    setSelectedConsultation(null);
    setViewMode('list');
  };

  const handleTransfer = async () => {
    const newSpec = prompt('اكتب التخصص الذي تريد التحويل إليه:');
    if (newSpec && selectedConsultation) {
      await supabase.from('consultations').update({ specialization: newSpec }).eq('id', selectedConsultation.id);
      handleSkip();
    }
  };

  const handleReport = async () => {
    if(confirm('هل أنت متأكد من الإبلاغ عن هذه الاستشارة كإساءة؟')) {
       await supabase.from('consultations').update({ status: 'flagged' }).eq('id', selectedConsultation?.id);
       handleSkip();
    }
  };

  const startReply = () => {
    setStep(1);
    setReplyData({
      diagnosis: '', selectedTests: [], selectedImaging: [], prescriptions: [], healthMessages: [], followUpDate: '', notes: ''
    });
    setViewMode('reply');
  };

  // --- Medicine Helper ---
  const addMedicine = () => {
    if(!tempMed.name) return alert('اختر اسم الدواء');
    setReplyData({
      ...replyData, 
      prescriptions: [...replyData.prescriptions, tempMed]
    });
    setTempMed({ name: '', form: '', concentration: '', frequency: '', duration: '', relation: '', timing: '', notes: '' });
  };

  const removeMedicine = (index: number) => {
    const newMeds = [...replyData.prescriptions];
    newMeds.splice(index, 1);
    setReplyData({ ...replyData, prescriptions: newMeds });
  };

  // --- Submit Final Reply ---
  const handleSubmitReply = async () => {
    if(!selectedConsultation) return;

    const { error } = await supabase.from('consultations').update({
       status: 'completed',
       response_text: `التشخيص: ${replyData.diagnosis} \n\nملاحظات: ${replyData.notes}`,
       medicines: JSON.stringify(replyData.prescriptions),
       tests: replyData.selectedTests.join(', '),
       imaging: replyData.selectedImaging.join(', '),
       health_messages: JSON.stringify(replyData.healthMessages),
    }).eq('id', selectedConsultation.id);

    if(!error) {
       alert('تم إرسال الرد بنجاح');
       handleSkip();
    } else {
       alert('حدث خطأ أثناء الحفظ');
    }
  };

  // --- RENDER ---
  
  if (loading) return <div className="flex justify-center items-center h-screen text-blue-600">جاري تحميل الاستشارات...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-cairo" dir="rtl">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-blue-600"/> الاستشارات الطبية
          </h1>
          <p className="text-slate-500 text-sm">لديك {consultations.length} استشارة مفتوحة بانتظار الرد</p>
        </div>
      </header>

      {/* VIEW 1: GRID OF CARDS */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.length === 0 ? (
             <div className="col-span-full text-center py-20 text-slate-400">لا توجد استشارات جديدة</div>
          ) : (
            consultations.map(consultation => (
              <div key={consultation.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer group" onClick={() => handleOpenConsultation(consultation)}>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{consultation.specialization}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3"/> {getTimeElapsed(consultation.created_at)}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">
                   {consultation.complaint_text.substring(0, 50)}...
                </h3>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                   <span className="text-xs text-slate-500 font-medium">
                     {consultation.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                   </span>
                   <button className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-[-5px] transition-transform">
                     عرض التفاصيل <ArrowLeft className="w-4 h-4"/>
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: DETAILS & ACTIONS */}
      {viewMode === 'details' && selectedConsultation && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
           <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">تفاصيل الاستشارة</h2>
              <button onClick={() => setViewMode('list')} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X className="w-5 h-5"/></button>
           </div>
           
           <div className="p-8 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <p className="text-sm text-slate-500 mb-1">نص الشكوى</p>
                 <p className="text-lg font-medium text-slate-800 leading-relaxed">{selectedConsultation.complaint_text}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div><span className="text-slate-500 block">التخصص:</span> <b>{selectedConsultation.specialization}</b></div>
                 <div><span className="text-slate-500 block">تاريخ الإنشاء:</span> <b>{new Date(selectedConsultation.created_at).toLocaleDateString('ar-EG')}</b></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                 <button onClick={startReply} className="col-span-2 md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition">
                    <MessageSquare className="w-5 h-5"/> الرد
                 </button>
                 <button onClick={handleTransfer} className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition">
                    <Share2 className="w-5 h-5"/> تحويل
                 </button>
                 <button onClick={handleReport} className="bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition">
                    <AlertTriangle className="w-5 h-5"/> إبلاغ
                 </button>
                 <button onClick={handleSkip} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition">
                    <ArrowRight className="w-5 h-5"/> تخطي
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* VIEW 3: REPLY WIZARD */}
      {viewMode === 'reply' && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
             <h2 className="font-bold">الرد الطبي - خطوة {step} من 7</h2>
             <button onClick={() => setViewMode('details')} className="text-slate-400 hover:text-white">إلغاء</button>
          </div>
          
          <div className="w-full bg-slate-200 h-2">
             <div className="bg-green-500 h-2 transition-all duration-300" style={{ width: `${(step/7)*100}%` }}></div>
          </div>

          <div className="p-8 min-h-[400px]">
            
            {step === 1 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">1. التشخيص المبدئي</h3>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-600">اختر تشخيصاً أو اكتب يدوياً:</label>
                     <input 
                       list="diagnoses" 
                       className="w-full p-3 border rounded-xl"
                       placeholder="ابحث عن تشخيص..." 
                       value={replyData.diagnosis}
                       onChange={e => setReplyData({...replyData, diagnosis: e.target.value})}
                     />
                     <datalist id="diagnoses">
                        {diagnosesList.map((d, i) => <option key={i} value={d.diagnosis_name} />)}
                     </datalist>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">2. التحاليل المطلوبة</h3>
                  <div className="flex gap-2 mb-4">
                     <select className="flex-1 p-3 border rounded-xl" id="testSelect">
                        <option value="">-- اختر تحليل --</option>
                        {testsList.map((t, i) => <option key={i} value={t.test_name}>{t.test_name}</option>)}
                     </select>
                     <button onClick={() => {
                        const val = (document.getElementById('testSelect') as HTMLSelectElement).value;
                        if(val && !replyData.selectedTests.includes(val)) 
                           setReplyData({...replyData, selectedTests: [...replyData.selectedTests, val]});
                     }} className="bg-blue-600 text-white p-3 rounded-xl"><Plus/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {replyData.selectedTests.map((t, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                           {t} <button onClick={() => {
                              const nt = replyData.selectedTests.filter((_, idx) => idx !== i);
                              setReplyData({...replyData, selectedTests: nt});
                           }}><X className="w-3 h-3 hover:text-red-500"/></button>
                        </span>
                     ))}
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">3. الأشعات المطلوبة</h3>
                  <div className="flex gap-2 mb-4">
                     <select className="flex-1 p-3 border rounded-xl" id="imgSelect">
                        <option value="">-- اختر أشعة --</option>
                        {imagingList.map((t, i) => <option key={i} value={t.imaging_name}>{t.imaging_name}</option>)}
                     </select>
                     <button onClick={() => {
                        const val = (document.getElementById('imgSelect') as HTMLSelectElement).value;
                        if(val && !replyData.selectedImaging.includes(val)) 
                           setReplyData({...replyData, selectedImaging: [...replyData.selectedImaging, val]});
                     }} className="bg-blue-600 text-white p-3 rounded-xl"><Plus/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {replyData.selectedImaging.map((t, i) => (
                        <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                           {t} <button onClick={() => {
                              const nt = replyData.selectedImaging.filter((_, idx) => idx !== i);
                              setReplyData({...replyData, selectedImaging: nt});
                           }}><X className="w-3 h-3 hover:text-red-500"/></button>
                        </span>
                     ))}
                  </div>
               </div>
            )}

            {step === 4 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">4. الوصفة الطبية (الأدوية)</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div className="col-span-2 md:col-span-4">
                        <label className="text-xs font-bold text-slate-500">اسم الدواء</label>
                        <input list="meds" className="w-full p-2 border rounded" value={tempMed.name} onChange={e=>setTempMed({...tempMed, name: e.target.value})} placeholder="اختر الدواء..." />
                        <datalist id="meds">{medicinesList.map((m, i)=> <option key={i} value={m.medicine_name}/>)}</datalist>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">الشكل (Form)</label>
                        <select className="w-full p-2 border rounded" value={tempMed.form} onChange={e=>setTempMed({...tempMed, form: e.target.value})}>
                           <option value="">اختر</option><option value="أقراص">أقراص</option><option value="شراب">شراب</option><option value="حقن">حقن</option><option value="لبوس">لبوس</option><option value="مرهم">مرهم</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">التركيز</label>
                        <input className="w-full p-2 border rounded" placeholder="مثال: 500mg" value={tempMed.concentration} onChange={e=>setTempMed({...tempMed, concentration: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">التكرار</label>
                        <select className="w-full p-2 border rounded" value={tempMed.frequency} onChange={e=>setTempMed({...tempMed, frequency: e.target.value})}>
                           <option value="">اختر</option><option value="مرة يومياً">1 / يوم</option><option value="مرتين يومياً">2 / يوم</option><option value="3 مرات يومياً">3 / يوم</option><option value="عند اللزوم">عند اللزوم</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">المدة</label>
                        <input className="w-full p-2 border rounded" placeholder="مثال: 5 أيام" value={tempMed.duration} onChange={e=>setTempMed({...tempMed, duration: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">علاقة بالأكل</label>
                        <select className="w-full p-2 border rounded" value={tempMed.relation} onChange={e=>setTempMed({...tempMed, relation: e.target.value})}>
                           <option value="">اختر</option><option value="بعد الأكل">بعد الأكل</option><option value="قبل الأكل">قبل الأكل</option><option value="وسط الأكل">وسط الأكل</option>
                        </select>
                     </div>
                     <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500">ملاحظات</label>
                        <input className="w-full p-2 border rounded" value={tempMed.notes} onChange={e=>setTempMed({...tempMed, notes: e.target.value})} />
                     </div>
                     <div className="col-span-2 md:col-span-1 flex items-end">
                        <button onClick={addMedicine} className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">إضافة الدواء</button>
                     </div>
                  </div>

                  <div className="space-y-2 mt-4">
                     {replyData.prescriptions.map((med, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm">
                           <div>
                              <p className="font-bold text-slate-800">{med.name} <span className="text-xs text-slate-500">({med.concentration}) - {med.form}</span></p>
                              <p className="text-xs text-slate-600">{med.frequency} لمدة {med.duration} - {med.relation}</p>
                           </div>
                           <button onClick={() => removeMedicine(i)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4"/></button>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {step === 5 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">5. التثقيف الصحي</h3>
                  <div className="flex gap-2 mb-4">
                     <select className="flex-1 p-3 border rounded-xl" id="msgSelect">
                        <option value="">-- اختر رسالة صحية --</option>
                        {messagesList.map((m, i) => <option key={i} value={m.message_text}>{m.message_text}</option>)}
                     </select>
                     <button onClick={() => {
                        const val = (document.getElementById('msgSelect') as HTMLSelectElement).value;
                        if(val && !replyData.healthMessages.includes(val)) 
                           setReplyData({...replyData, healthMessages: [...replyData.healthMessages, val]});
                     }} className="bg-green-600 text-white p-3 rounded-xl"><Plus/></button>
                  </div>
                  <div className="space-y-2">
                     {replyData.healthMessages.map((msg, i) => (
                        <div key={i} className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                           <p className="text-sm text-green-800 font-medium">{msg}</p>
                           <button onClick={() => {
                              const nm = replyData.healthMessages.filter((_, idx) => idx !== i);
                              setReplyData({...replyData, healthMessages: nm});
                           }} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4"/></button>
                        </div>
                     ))}
                     {replyData.healthMessages.length === 0 && <p className="text-sm text-slate-400 text-center py-4">لم يتم إضافة أي رسائل بعد</p>}
                  </div>
               </div>
            )}

            {step === 6 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">6. المتابعة والملاحظات</h3>
                  <div>
                     <label className="text-sm font-bold text-slate-600 mb-2 block">تاريخ المتابعة (اختياري)</label>
                     <input type="date" className="w-full p-3 border rounded-xl" value={replyData.followUpDate} onChange={e => setReplyData({...replyData, followUpDate: e.target.value})} />
                  </div>
                  <div className="mt-4">
                     <label className="text-sm font-bold text-slate-600 mb-2 block">ملاحظات ختامية للطبيب أو المريض</label>
                     <textarea className="w-full p-4 border rounded-xl h-32" value={replyData.notes} onChange={e => setReplyData({...replyData, notes: e.target.value})} placeholder="أي تفاصيل أخرى..."></textarea>
                  </div>
               </div>
            )}

            {step === 7 && selectedConsultation && (
               <div className="animate-in fade-in">
                  <div className="flex justify-between items-center mb-4 px-4">
                     <h3 className="text-2xl font-bold text-slate-800">معاينة الروشتة قبل الحفظ</h3>
                     <div className="flex gap-2">
                        <button onClick={handlePrint} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                           <Printer className="w-4 h-4"/> طباعة
                        </button>
                        <button onClick={handleSubmitReply} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-200 hover:bg-green-700">
                           <CheckCircle className="w-4 h-4"/> حفظ وإنهاء
                        </button>
                     </div>
                  </div>
                  
                  <div className="bg-slate-200 p-8 overflow-auto max-h-[600px] rounded-xl border border-slate-300">
                     <PrescriptionView 
                        ref={printRef}
                        patientName={selectedConsultation.patient?.full_name || 'مريض زائر'}
                        doctorName="أحمد محمد"
                        date={new Date().toLocaleDateString('ar-EG')}
                        diagnosis={replyData.diagnosis}
                        medicines={replyData.prescriptions}
                        tests={replyData.selectedTests}
                        imaging={replyData.selectedImaging}
                        healthMessages={replyData.healthMessages}
                        notes={replyData.notes}
                     />
                  </div>
               </div>
            )}

          </div>

          <div className="p-4 border-t border-slate-200 flex justify-between">
             {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="px-6 py-2 rounded-lg border hover:bg-slate-50 font-bold text-slate-600">السابق</button>
             ) : <div></div>}
             
             {step < 7 && (
                <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800">التالي</button>
             )}
          </div>
        </div>
      )}

    </div>
  );
}

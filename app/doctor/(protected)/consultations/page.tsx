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
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  blood_pressure?: string;
  temperature?: number;
  pulse?: number;
  chronic_diseases?: string;
  is_pregnant?: boolean;
  is_breastfeeding?: boolean;
  previous_surgeries?: boolean;
  surgery_details?: string;
  drug_allergies?: boolean;
  allergy_details?: string;
  current_medications?: boolean;
  medication_details?: string;
  mental_health_issues?: boolean;
  mental_health_details?: string;
  has_disability?: boolean;
};

type Consultation = {
  id: string;
  specialization: string;
  status: string;
  created_at: string;
  complaint_text: string;
  transfer_note?: string;
  patient?: PatientData;
};

const getTimeElapsed = (dateString: string) => {
  const diff = new Date().getTime() - new Date(dateString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  return 'منذ أقل من ساعة';
};

export default function DoctorConsultationsPage() {
  const [currentDoctor, setCurrentDoctor] = useState<{id: string, full_name: string, specialization: string} | null>(null);
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'inbox' | 'history'>('inbox');
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'reply'>('list');

  const [diagnosesList, setDiagnosesList] = useState<any[]>([]);
  const [testsList, setTestsList] = useState<any[]>([]);
  const [imagingList, setImagingList] = useState<any[]>([]);
  const [medicinesList, setMedicinesList] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);

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

  const [tempMed, setTempMed] = useState({
    name: '', form: '', concentration: '', frequency: '', duration: '', relation: '', timing: '', notes: ''
  });

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => { if (printRef.current) { const original = document.body.innerHTML; document.body.innerHTML = printRef.current.outerHTML; window.print(); window.location.reload(); } };

  // --- Initial Fetch ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: doc } = await supabase.from('doctors').select('*').eq('email', user.email).single();
        if (doc) setCurrentDoctor(doc);
      }
    };
    init();
    fetchLists();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (currentDoctor) fetchConsultations();
  }, [currentDoctor, activeTab]);

  const fetchConsultations = async () => {
    setLoading(true);
    let query = supabase.from('consultations').select('*, patient:patients(*)');

    if (activeTab === 'inbox') {
      query = query.eq('status', 'open').eq('specialization', currentDoctor?.specialization); 
    } else {
      query = query.eq('status', 'completed').eq('doctor_id', currentDoctor?.id);
    }

    const { data } = await query.order('created_at', { ascending: false });
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

  const fetchSettings = async () => {
    const { data } = await supabase.from('system_settings').select('specializations').single();
    if (data && data.specializations) setAvailableSpecializations(data.specializations.split(','));
  };

  const handleOpenConsultation = (consultation: Consultation) => { setSelectedConsultation(consultation); setViewMode('details'); };
  const handleSkip = () => { setConsultations(prev => prev.filter(c => c.id !== selectedConsultation?.id)); setSelectedConsultation(null); setViewMode('list'); setShowTransferModal(false); };

  const handleTransfer = async (targetSpec: string) => {
    if (!selectedConsultation || !currentDoctor) return;
    const note = `تم التحويل من تخصص ${currentDoctor.specialization} بواسطة د. ${currentDoctor.full_name}`;
    const { error } = await supabase.from('consultations').update({ specialization: targetSpec, transfer_note: note }).eq('id', selectedConsultation.id);
    if (!error) { alert(`تم التحويل إلى ${targetSpec}`); handleSkip(); } else { alert('حدث خطأ'); }
  };

  const handleReport = async () => {
    if(confirm('تأكيد الإبلاغ كإساءة؟')) { await supabase.from('consultations').update({ status: 'flagged', is_flagged: true }).eq('id', selectedConsultation?.id); handleSkip(); }
  };

  const startReply = () => { setStep(1); setReplyData({ diagnosis: '', selectedTests: [], selectedImaging: [], prescriptions: [], healthMessages: [], followUpDate: '', notes: '' }); setViewMode('reply'); };

  const addMedicine = () => {
    if(!tempMed.name) return alert('اختر اسم الدواء');
    setReplyData({ ...replyData, prescriptions: [...replyData.prescriptions, tempMed] });
    setTempMed({ name: '', form: '', concentration: '', frequency: '', duration: '', relation: '', timing: '', notes: '' });
  };
  const removeMedicine = (index: number) => { const newMeds = [...replyData.prescriptions]; newMeds.splice(index, 1); setReplyData({ ...replyData, prescriptions: newMeds }); };

  const handleSubmitReply = async () => {
    if(!selectedConsultation || !currentDoctor) return;
    const { error } = await supabase.from('consultations').update({
       status: 'completed',
       doctor_id: currentDoctor.id,
       response_text: `التشخيص: ${replyData.diagnosis} \n\nملاحظات: ${replyData.notes}`,
       medicines: JSON.stringify(replyData.prescriptions),
       tests: replyData.selectedTests.join(', '),
       imaging: replyData.selectedImaging.join(', '),
       health_messages: JSON.stringify(replyData.healthMessages),
    }).eq('id', selectedConsultation.id);
    if(!error) { alert('تم الحفظ والإرسال'); handleSkip(); } else { alert('خطأ في الحفظ'); }
  };

  const PatientMedicalProfile = ({ patient }: { patient: PatientData }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
       <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600"/> الملف الطبي للمريض</h3>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div><p className="text-xs text-slate-500">الوزن</p><p className="font-bold">{patient.weight_kg ? `${patient.weight_kg} kg` : '-'}</p></div>
          <div><p className="text-xs text-slate-500">الطول</p><p className="font-bold">{patient.height_cm ? `${patient.height_cm} cm` : '-'}</p></div>
          <div><p className="text-xs text-slate-500">الضغط</p><p className="font-bold">{patient.blood_pressure || '-'}</p></div>
          <div><p className="text-xs text-slate-500">الحرارة</p><p className="font-bold">{patient.temperature ? `${patient.temperature}°` : '-'}</p></div>
       </div>
       <div className="space-y-3">
          {patient.chronic_diseases && <div className="flex gap-2 items-start"><AlertOctagon className="w-4 h-4 text-red-500 mt-1"/><p className="text-sm"><strong>أمراض مزمنة:</strong> {patient.chronic_diseases}</p></div>}
          {patient.current_medications && <div className="flex gap-2 items-start"><FileText className="w-4 h-4 text-blue-500 mt-1"/><p className="text-sm"><strong>أدوية حالية:</strong> {patient.medication_details}</p></div>}
          {patient.drug_allergies && <div className="flex gap-2 items-start bg-red-50 p-2 rounded border border-red-100"><AlertTriangle className="w-4 h-4 text-red-600 mt-1"/><p className="text-sm text-red-800"><strong>حساسية أدوية:</strong> {patient.allergy_details}</p></div>}
          {patient.previous_surgeries && <div className="flex gap-2 items-start"><Activity className="w-4 h-4 text-slate-500 mt-1"/><p className="text-sm"><strong>عمليات سابقة:</strong> {patient.surgery_details}</p></div>}
          {patient.gender === 'female' && <div className="flex gap-4 mt-2">
             {patient.is_pregnant && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded font-bold flex items-center gap-1"><Baby className="w-3 h-3"/> حامل</span>}
             {patient.is_breastfeeding && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded font-bold">مرضع</span>}
          </div>}
       </div>
    </div>
  );

  if (!currentDoctor) return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">جاري التحقق من بيانات الطبيب...</div>;
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">جاري تحميل الاستشارات...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-cairo" dir="rtl">
      
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Stethoscope className="text-blue-600"/> عيادة {currentDoctor.specialization}</h1>
          <p className="text-slate-500 text-sm">مرحباً د. {currentDoctor.full_name}</p>
        </div>
        <div className="flex bg-white w-fit p-1 rounded-xl shadow-sm border border-slate-200">
          <button onClick={() => { setActiveTab('inbox'); setViewMode('list'); }} className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'inbox' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}><Inbox className="w-4 h-4"/> الاستشارات الواردة</button>
          <button onClick={() => { setActiveTab('history'); setViewMode('list'); }} className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${activeTab === 'history' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}><History className="w-4 h-4"/> أرشيف ردودي</button>
        </div>
      </header>

      {/* VIEW 1: LIST */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultations.length === 0 ? <div className="col-span-full text-center py-20 text-slate-400 font-bold">{activeTab === 'inbox' ? 'لا توجد استشارات جديدة في تخصصك' : 'لم تقم بالرد على أي استشارة بعد'}</div> : 
            consultations.map(consultation => (
              <div key={consultation.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer group relative overflow-hidden" onClick={() => handleOpenConsultation(consultation)}>
                {consultation.transfer_note && <div className="bg-orange-100 text-orange-800 text-[10px] p-1 px-3 mb-3 rounded-full w-fit font-bold border border-orange-200 flex items-center gap-1"><Share2 className="w-3 h-3"/> {consultation.transfer_note}</div>}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeTab === 'inbox' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>{activeTab === 'inbox' ? 'واردة' : 'تم الرد'}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3"/> {getTimeElapsed(consultation.created_at)}</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{consultation.complaint_text.substring(0, 50)}...</h3>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                   <span className="text-xs text-slate-500 font-bold">{consultation.patient?.full_name || 'مجهول'}</span>
                   <button className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-[-5px] transition-transform">{activeTab === 'inbox' ? 'فتح ورد' : 'عرض الروشتة'} <ArrowLeft className="w-4 h-4"/></button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* VIEW 2: DETAILS */}
      {viewMode === 'details' && selectedConsultation && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
           <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div><h2 className="text-xl font-bold">تفاصيل الاستشارة</h2><p className="text-sm text-blue-100">المريض: {selectedConsultation.patient?.full_name}</p></div>
              <button onClick={() => setViewMode('list')} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X className="w-5 h-5"/></button>
           </div>
           <div className="p-8">
              {selectedConsultation.transfer_note && <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-xl mb-6 font-bold text-sm flex items-center gap-2"><Share2 className="w-4 h-4"/> {selectedConsultation.transfer_note}</div>}
              {selectedConsultation.patient && <PatientMedicalProfile patient={selectedConsultation.patient} />}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8"><p className="text-sm text-slate-500 mb-1 font-bold">الشكوى الحالية:</p><p className="text-lg font-medium text-slate-800 leading-relaxed whitespace-pre-line">{selectedConsultation.complaint_text}</p></div>

              {activeTab === 'inbox' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                   <button onClick={startReply} className="col-span-2 md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition"><MessageSquare className="w-5 h-5"/> الرد</button>
                   <button onClick={() => setShowTransferModal(true)} className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition"><Share2 className="w-5 h-5"/> تحويل</button>
                   <button onClick={handleReport} className="bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition"><AlertTriangle className="w-5 h-5"/> إبلاغ</button>
                   <button onClick={handleSkip} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition"><ArrowRight className="w-5 h-5"/> تخطي</button>
                </div>
              ) : (
                <div className="text-center mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
                   <p className="text-green-600 font-bold mb-2">✅ تم الرد على هذه الاستشارة</p>
                   <button onClick={() => { setStep(7); setViewMode('reply'); }} className="text-blue-600 font-bold underline">عرض الروشتة المرسلة</button>
                </div>
              )}
           </div>

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

      {/* VIEW 3: REPLY WIZARD */}
      {viewMode === 'reply' && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
             <h2 className="font-bold">الرد الطبي - خطوة {step} من 7</h2>
             <button onClick={() => setViewMode('details')} className="text-slate-400 hover:text-white">إلغاء</button>
          </div>
          <div className="w-full bg-slate-200 h-2"><div className="bg-green-500 h-2 transition-all duration-300" style={{ width: `${(step/7)*100}%` }}></div></div>
          
          <div className="p-8 min-h-[400px]">
            {/* Step 1: Diagnosis */}
            {step === 1 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">1. التشخيص المبدئي</h3>
                  <input list="d" className="w-full p-3 border rounded-xl" placeholder="ابحث عن تشخيص..." value={replyData.diagnosis} onChange={e=>setReplyData({...replyData, diagnosis:e.target.value})}/>
                  <datalist id="d">{diagnosesList.map((d,i)=><option key={i} value={d.diagnosis_name}/>)}</datalist>
               </div>
            )}

            {/* Step 2: Tests */}
            {step === 2 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">2. التحاليل المطلوبة</h3>
                  <div className="flex gap-2 mb-4">
                     <select className="flex-1 p-3 border rounded-xl" id="ts"><option value="">-- اختر تحليل --</option>{testsList.map((t,i)=><option key={i} value={t.test_name}>{t.test_name}</option>)}</select>
                     <button onClick={()=>{const val=(document.getElementById('ts') as HTMLSelectElement).value; if(val && !replyData.selectedTests.includes(val)) setReplyData({...replyData, selectedTests:[...replyData.selectedTests, val]})}} className="bg-blue-600 text-white p-3 rounded-xl"><Plus/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">{replyData.selectedTests.map((t,i)=><span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">{t} <button onClick={()=>setReplyData({...replyData, selectedTests:replyData.selectedTests.filter((_,x)=>x!==i)})}><X className="w-3 h-3"/></button></span>)}</div>
               </div>
            )}

            {/* Step 3: Imaging */}
            {step === 3 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">3. الأشعات المطلوبة</h3>
                  <div className="flex gap-2 mb-4">
                     <select className="flex-1 p-3 border rounded-xl" id="img"><option value="">-- اختر أشعة --</option>{imagingList.map((t,i)=><option key={i} value={t.imaging_name}>{t.imaging_name}</option>)}</select>
                     <button onClick={()=>{const val=(document.getElementById('img') as HTMLSelectElement).value; if(val && !replyData.selectedImaging.includes(val)) setReplyData({...replyData, selectedImaging:[...replyData.selectedImaging, val]})}} className="bg-blue-600 text-white p-3 rounded-xl"><Plus/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">{replyData.selectedImaging.map((t,i)=><span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">{t} <button onClick={()=>setReplyData({...replyData, selectedImaging:replyData.selectedImaging.filter((_,x)=>x!==i)})}><X className="w-3 h-3"/></button></span>)}</div>
               </div>
            )}

            {/* Step 4: Medicines (FULL FORM) */}
            {step === 4 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">4. الوصفة الطبية (الأدوية)</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div className="col-span-2 md:col-span-4">
                        <label className="text-xs font-bold text-slate-500">اسم الدواء</label>
                        <input list="mds" className="w-full p-2 border rounded" value={tempMed.name} onChange={e=>setTempMed({...tempMed, name:e.target.value})} placeholder="ابحث عن دواء..."/>
                        <datalist id="mds">{medicinesList.map((m,i)=><option key={i} value={m.medicine_name}/>)}</datalist>
                     </div>
                     <div><label className="text-xs font-bold text-slate-500">الشكل (Form)</label><select className="w-full p-2 border rounded" value={tempMed.form} onChange={e=>setTempMed({...tempMed, form:e.target.value})}><option value="">اختر</option><option value="أقراص">أقراص</option><option value="شراب">شراب</option><option value="حقن">حقن</option><option value="مرهم">مرهم</option><option value="نقط">نقط</option></select></div>
                     <div><label className="text-xs font-bold text-slate-500">التركيز</label><input className="w-full p-2 border rounded" value={tempMed.concentration} onChange={e=>setTempMed({...tempMed, concentration:e.target.value})} placeholder="500mg"/></div>
                     <div><label className="text-xs font-bold text-slate-500">التكرار</label><select className="w-full p-2 border rounded" value={tempMed.frequency} onChange={e=>setTempMed({...tempMed, frequency:e.target.value})}><option value="">اختر</option><option value="مرة يومياً">1 / يوم</option><option value="مرتين يومياً">2 / يوم</option><option value="3 مرات يومياً">3 / يوم</option><option value="عند اللزوم">عند اللزوم</option></select></div>
                     <div><label className="text-xs font-bold text-slate-500">المدة</label><input className="w-full p-2 border rounded" value={tempMed.duration} onChange={e=>setTempMed({...tempMed, duration:e.target.value})} placeholder="5 أيام"/></div>
                     <div><label className="text-xs font-bold text-slate-500">علاقة بالأكل</label><select className="w-full p-2 border rounded" value={tempMed.relation} onChange={e=>setTempMed({...tempMed, relation:e.target.value})}><option value="">اختر</option><option value="بعد الأكل">بعد الأكل</option><option value="قبل الأكل">قبل الأكل</option><option value="وسط الأكل">وسط الأكل</option></select></div>
                     <div className="col-span-2"><label className="text-xs font-bold text-slate-500">ملاحظات</label><input className="w-full p-2 border rounded" value={tempMed.notes} onChange={e=>setTempMed({...tempMed, notes:e.target.value})} /></div>
                     <div className="col-span-2 md:col-span-1 flex items-end"><button onClick={addMedicine} className="w-full bg-green-600 text-white py-2 rounded font-bold">إضافة</button></div>
                  </div>
                  <div className="space-y-2 mt-4">{replyData.prescriptions.map((m,i)=><div key={i} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm"><div className="text-sm"><p className="font-bold text-slate-800">{m.name} ({m.concentration})</p><p className="text-slate-500 text-xs">{m.frequency} - {m.duration}</p></div><button onClick={()=>removeMedicine(i)} className="text-red-500"><Trash2 className="w-4 h-4"/></button></div>)}</div>
               </div>
            )}

            {/* Step 5: Health Messages */}
            {step === 5 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">5. التثقيف الصحي</h3>
                  <div className="flex gap-2 mb-4">
                     <select className="flex-1 p-3 border rounded-xl" id="hm"><option value="">-- اختر رسالة صحية --</option>{messagesList.map((m,i)=><option key={i} value={m.message_text}>{m.message_text}</option>)}</select>
                     <button onClick={()=>{const val=(document.getElementById('hm') as HTMLSelectElement).value; if(val && !replyData.healthMessages.includes(val)) setReplyData({...replyData, healthMessages:[...replyData.healthMessages, val]})}} className="bg-green-600 text-white p-3 rounded-xl"><Plus/></button>
                  </div>
                  <div className="space-y-2">{replyData.healthMessages.map((m,i)=><div key={i} className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100"><p className="text-sm text-green-800">{m}</p><button onClick={()=>setReplyData({...replyData, healthMessages:replyData.healthMessages.filter((_,x)=>x!==i)})}><Trash2 className="w-4 h-4 text-red-500"/></button></div>)}</div>
               </div>
            )}

            {/* Step 6: Follow Up & Notes */}
            {step === 6 && (
               <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">6. المتابعة والملاحظات</h3>
                  <div><label className="text-sm font-bold text-slate-600 mb-2 block">تاريخ المتابعة (اختياري)</label><input type="date" className="w-full p-3 border rounded-xl" value={replyData.followUpDate} onChange={e=>setReplyData({...replyData, followUpDate:e.target.value})}/></div>
                  <div className="mt-4"><label className="text-sm font-bold text-slate-600 mb-2 block">ملاحظات ختامية</label><textarea className="w-full p-4 border rounded-xl h-32" value={replyData.notes} onChange={e=>setReplyData({...replyData, notes:e.target.value})}/></div>
               </div>
            )}

            {/* Step 7: Preview Prescription */}
            {step === 7 && selectedConsultation && (
               <div className="animate-in fade-in">
                  <div className="flex justify-between items-center mb-4 px-4">
                     <h3 className="text-2xl font-bold text-slate-800">معاينة الروشتة</h3>
                     <div className="flex gap-2">
                        <button onClick={handlePrint} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Printer className="w-4 h-4"/> طباعة</button>
                        {activeTab === 'inbox' && <button onClick={handleSubmitReply} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-200 hover:bg-green-700"><CheckCircle className="w-4 h-4"/> حفظ وإرسال</button>}
                     </div>
                  </div>
                  <div className="bg-slate-200 p-8 overflow-auto max-h-[600px] rounded-xl border border-slate-300">
                     <PrescriptionView 
                        ref={printRef}
                        doctorName={currentDoctor.full_name}
                        specialization={currentDoctor.specialization}
                        date={new Date().toLocaleDateString('ar-EG')}
                        patientName={selectedConsultation.patient?.full_name || 'غير معروف'}
                        weight={selectedConsultation.patient?.weight_kg}
                        height={selectedConsultation.patient?.height_cm}
                        complaint={selectedConsultation.complaint_text}
                        diagnosis={replyData.diagnosis}
                        medicines={replyData.prescriptions}
                        tests={replyData.selectedTests}
                        imaging={replyData.selectedImaging}
                        healthMessages={replyData.healthMessages}
                        notes={replyData.notes}
                        followUpDate={replyData.followUpDate}
                     />
                  </div>
               </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 flex justify-between">
             {step > 1 ? <button onClick={() => setStep(s => s - 1)} className="px-6 py-2 rounded-lg border hover:bg-slate-50 font-bold text-slate-600">السابق</button> : <div></div>}
             {step < 7 && <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800">التالي</button>}
          </div>
        </div>
      )}

    </div>
  );
}

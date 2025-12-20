'use client';

// ... (نفس الاستيرادات السابقة)
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print'; // (اختياري، لو مش عندك استخدم window.print)
import { PrescriptionView } from '@/components/PrescriptionView'; // استيراد المكون الجديد
import { Printer, Download, Check } from 'lucide-react';

// ... (نفس تعريف Types و Helpers)

export default function DoctorConsultationsPage() {
  // ... (نفس الـ State القديم)
  
  // تحديث الـ State الخاص بالرد لدعم مصفوفة الرسائل
  const [replyData, setReplyData] = useState({
    diagnosis: '',
    selectedTests: [] as string[],
    selectedImaging: [] as string[],
    prescriptions: [] as any[],
    healthMessages: [] as string[], // <-- تغيير هنا: مصفوفة بدلاً من نص
    followUpDate: '',
    notes: ''
  });

  const printRef = useRef<HTMLDivElement>(null);
  
  // دالة الطباعة
  const handlePrint = () => {
    // طريقة بسيطة بدون مكتبات خارجية
    const content = printRef.current;
    if (content) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = content.outerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // إعادة تحميل لاستعادة الصفحة (حل سريع)
    }
  };

  // ... (نفس دوال fetch و handlers القديمة)

  // --- تحديث STEP 5: إضافة منطق تعدد الرسائل ---
  /* استبدل الجزء الخاص بـ Step 5 بهذا الكود داخل الـ Render */
  /*
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
             
             {replyData.healthMessages.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">لم يتم إضافة أي رسائل بعد</p>
             )}
          </div>
       </div>
    )}
  */

  // --- تحديث STEP 7: المعاينة والحفظ ---
  /* استبدل Step 7 بهذا الكود */
  /*
    {step === 7 && selectedConsultation && (
       <div className="animate-in fade-in">
          <div className="flex justify-between items-center mb-4 px-4">
             <h3 className="text-2xl font-bold text-slate-800">معاينة الروشتة قبل الحفظ</h3>
             <div className="flex gap-2">
                <button onClick={handlePrint} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                   <Printer className="w-4 h-4"/> طباعة / PDF
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
                doctorName="أحمد محمد" // يمكنك جلبه من الجلسة
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
  */

  // تحديث دالة الحفظ لتدعم المصفوفة
  const handleSubmitReply = async () => {
    if(!selectedConsultation) return;

    const { error } = await supabase.from('consultations').update({
       status: 'completed',
       response_text: `التشخيص: ${replyData.diagnosis} \n\nملاحظات: ${replyData.notes}`,
       medicines: JSON.stringify(replyData.prescriptions),
       tests: replyData.selectedTests.join(', '),
       imaging: replyData.selectedImaging.join(', '),
       // حفظ الرسائل كمصفوفة JSON أو نص مفصول
       health_messages: JSON.stringify(replyData.healthMessages), 
    }).eq('id', selectedConsultation.id);

    if(!error) {
       alert('تم الحفظ بنجاح! انتقل للصفحة الرئيسية...');
       handleSkip();
    } else {
       alert('حدث خطأ أثناء الحفظ');
    }
  };

  // ... (باقي الكود)
}

import React, { forwardRef } from 'react';
import { Stethoscope, Phone, MapPin, Calendar, Activity, User, Scale, Ruler } from 'lucide-react';

interface PrescriptionProps {
  doctorName?: string;
  specialization?: string;
  centerName?: string;
  date: string;
  // بيانات المريض
  patientName: string;
  age?: string | number;
  weight?: string | number;
  height?: string | number;
  // المحتوى الطبي
  complaint: string; // الشكوى/الأعراض
  diagnosis: string;
  medicines: any[];
  tests: string[];
  imaging: string[];
  healthMessages: string[];
  notes: string;
  followUpDate?: string; // موعد الإعادة
}

export const PrescriptionView = forwardRef<HTMLDivElement, PrescriptionProps>((props, ref) => {
  return (
    <div ref={ref} className="bg-white text-black font-cairo mx-auto my-8 shadow-2xl overflow-hidden relative print:shadow-none print:m-0 flex flex-col" style={{ width: '210mm', minHeight: '297mm', padding: '10mm 15mm' }}>
      
      {/* 1. Header (الترويسة) */}
      <div className="border-b-2 border-blue-800 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-blue-900 mb-1">{props.centerName || 'المركز الطبي الذكي'}</h1>
          <p className="text-sm text-slate-500 font-bold">Smart Medical Center</p>
        </div>
        <div className="text-left">
           <h2 className="text-xl font-bold text-slate-800 flex items-center justify-end gap-2">
             <span>د. {props.doctorName || 'طبيب مناوب'}</span>
             <Stethoscope className="w-5 h-5 text-blue-600"/>
           </h2>
           <p className="text-sm text-slate-500 font-medium">{props.specialization || 'طب عام'}</p>
        </div>
      </div>

      {/* 2. Patient Vitals Strip (شريط بيانات المريض) */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 mb-6">
         <div className="grid grid-cols-4 gap-4 text-center divide-x divide-x-reverse divide-slate-300">
            <div>
               <p className="text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-center gap-1"><User className="w-3 h-3"/> اسم المريض</p>
               <p className="font-bold text-slate-900 truncate px-2">{props.patientName}</p>
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-center gap-1"><Calendar className="w-3 h-3"/> السن</p>
               <p className="font-bold text-slate-900">{props.age ? `${props.age} سنة` : '-'}</p>
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-center gap-1"><Scale className="w-3 h-3"/> الوزن</p>
               <p className="font-bold text-slate-900">{props.weight ? `${props.weight} Kg` : '-'}</p>
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-center gap-1"><Ruler className="w-3 h-3"/> الطول</p>
               <p className="font-bold text-slate-900">{props.height ? `${props.height} cm` : '-'}</p>
            </div>
         </div>
      </div>

      {/* 3. Clinical Info (الشكوى والتشخيص) */}
      <div className="mb-8 grid grid-cols-1 gap-4">
         <div className="border-r-4 border-orange-400 pr-3 bg-orange-50/50 p-2 rounded-r">
            <span className="text-xs font-bold text-orange-600 block mb-1">الشكوى والأعراض (Symptoms):</span>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">{props.complaint}</p>
         </div>
         <div className="border-r-4 border-blue-600 pr-3 bg-blue-50/50 p-2 rounded-r">
            <span className="text-xs font-bold text-blue-600 block mb-1">التشخيص (Diagnosis):</span>
            <p className="text-lg font-bold text-slate-900">{props.diagnosis}</p>
         </div>
      </div>

      {/* 4. Body Content (Rx) */}
      <div className="flex-1 space-y-6">
        
        {/* Medicines */}
        {props.medicines.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-serif italic font-black text-slate-800 mb-4 border-b w-full pb-2 flex items-center gap-2">
              <span className="text-3xl text-blue-700">Rx</span> 
              <span className="text-sm font-sans font-bold text-slate-400 mt-2 not-italic">الأدوية العلاجية</span>
            </h3>
            <ul className="space-y-4 px-2">
              {props.medicines.map((med, i) => (
                <li key={i} className="flex justify-between items-start border-b border-dashed border-slate-200 pb-2">
                  <div>
                    <p className="text-lg font-black text-slate-900">
                       ● {med.name} <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mx-1">{med.concentration}</span>
                    </p>
                    {med.notes && <p className="text-xs text-red-500 mr-5 mt-0.5">{med.notes}</p>}
                  </div>
                  <div className="text-left">
                     <p className="text-sm font-bold text-slate-700">{med.frequency}</p>
                     <p className="text-xs text-slate-400">{med.duration} - {med.relation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tests & Imaging Grid */}
        {(props.tests.length > 0 || props.imaging.length > 0) && (
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
             {props.tests.length > 0 && (
               <div>
                  <h3 className="text-sm font-black text-slate-800 mb-2 border-b border-slate-300 pb-1">التحاليل المطلوبة (Lab Tests)</h3>
                  <ul className="list-disc list-inside text-sm font-bold text-slate-600 space-y-1">
                    {props.tests.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
               </div>
             )}
             {props.imaging.length > 0 && (
               <div>
                  <h3 className="text-sm font-black text-slate-800 mb-2 border-b border-slate-300 pb-1">الأشعة المطلوبة (Radiology)</h3>
                  <ul className="list-disc list-inside text-sm font-bold text-slate-600 space-y-1">
                    {props.imaging.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
               </div>
             )}
          </div>
        )}

        {/* Health Messages & Notes */}
        {(props.healthMessages.length > 0 || props.notes) && (
          <div className="mt-4 p-4 border border-green-200 rounded-xl bg-green-50/30">
             {props.healthMessages.length > 0 && (
               <div className="mb-3">
                 <h3 className="text-sm font-black text-green-800 mb-2">تعليمات هامة:</h3>
                 <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                   {props.healthMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                 </ul>
               </div>
             )}
             {props.notes && (
               <div className="text-sm text-slate-600 pt-2 border-t border-green-200">
                 <span className="font-bold">ملاحظات: </span> {props.notes}
               </div>
             )}
          </div>
        )}
      </div>

      {/* 5. Footer (المتابعة والتوقيع) */}
      <div className="mt-auto pt-4 border-t-2 border-slate-800">
         <div className="flex justify-between items-end">
            
            {/* Re-visit Date */}
            <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-300">
               <p className="text-xs text-slate-500 font-bold mb-1">موعد الاستشارة القادمة</p>
               <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600"/>
                  <span className="font-black text-lg text-slate-800">{props.followUpDate ? new Date(props.followUpDate).toLocaleDateString('ar-EG') : 'يحدد لاحقاً'}</span>
               </div>
            </div>

            {/* Date & Signature */}
            <div className="text-center">
               <p className="text-xs text-slate-500 mb-1">{props.date}</p>
               <div className="h-10 w-40 border-b border-slate-800 mb-1"></div>
               <p className="font-bold text-slate-800 text-sm">توقيع الطبيب</p>
            </div>
         </div>

         {/* Contact Strip */}
         <div className="mt-4 flex justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Cairo, Egypt</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> 19000</span>
            <span className="flex items-center gap-1"><Activity className="w-3 h-3"/> www.smart-clinic.com</span>
         </div>
      </div>

    </div>
  );
});

PrescriptionView.displayName = 'PrescriptionView';

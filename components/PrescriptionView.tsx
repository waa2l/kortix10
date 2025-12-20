import React, { forwardRef } from 'react';
import { Stethoscope, Phone, MapPin, Calendar, User, Scale, Ruler, Pill, Activity } from 'lucide-react';

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
  complaint: string;
  diagnosis: string;
  medicines: any[]; // مصفوفة الأدوية بتفاصيلها الكاملة
  tests: string[];
  imaging: string[];
  healthMessages: string[];
  notes: string;
  followUpDate?: string;
}

export const PrescriptionView = forwardRef<HTMLDivElement, PrescriptionProps>((props, ref) => {
  return (
    <div ref={ref} className="bg-white text-black font-cairo mx-auto my-8 shadow-2xl overflow-hidden relative print:shadow-none print:m-0 flex flex-col" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
      
      {/* 1. Header (رأس الروشتة) */}
      <div className="border-b-4 border-blue-900 pb-6 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-blue-900 mb-2">{props.centerName || 'المركز الطبي الذكي'}</h1>
          <p className="text-sm text-slate-500 font-bold tracking-widest">SMART MEDICAL CENTER</p>
        </div>
        <div className="text-left">
           <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-end gap-2">
             <span>د. {props.doctorName || 'طبيب معالج'}</span>
             <Stethoscope className="w-6 h-6 text-blue-600"/>
           </h2>
           <p className="text-base text-slate-600 font-medium bg-blue-50 px-3 py-1 rounded-lg inline-block mt-1">{props.specialization || 'تخصص عام'}</p>
        </div>
      </div>

      {/* 2. Patient Info Strip (شريط بيانات المريض) */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8">
         <div className="grid grid-cols-4 gap-4 text-center divide-x divide-x-reverse divide-slate-300">
            <div className="col-span-1">
               <p className="text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-center gap-1"><User className="w-3 h-3"/> اسم المريض</p>
               <p className="font-bold text-slate-900 truncate px-2 text-lg">{props.patientName}</p>
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-center gap-1"><Calendar className="w-3 h-3"/> التاريخ</p>
               <p className="font-bold text-slate-900 dir-ltr">{props.date}</p>
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

      {/* 3. Diagnosis & Complaint (التشخيص والشكوى) */}
      <div className="mb-8 grid grid-cols-1 gap-4">
         {props.diagnosis && (
            <div className="border-r-4 border-blue-600 pr-4 pl-2 py-2 bg-blue-50/30 rounded-r-lg">
                <span className="text-xs font-bold text-blue-600 block mb-1">التشخيص (Diagnosis):</span>
                <p className="text-xl font-bold text-slate-900">{props.diagnosis}</p>
            </div>
         )}
         {props.complaint && (
            <div className="border-r-4 border-orange-400 pr-4 pl-2 py-2 bg-orange-50/30 rounded-r-lg">
                <span className="text-xs font-bold text-orange-600 block mb-1">شكوى المريض (Complaint):</span>
                <p className="text-sm text-slate-700 font-medium">{props.complaint}</p>
            </div>
         )}
      </div>

      {/* 4. Main Prescription Body (الأدوية) */}
      <div className="flex-1 space-y-8">
        
        {props.medicines.length > 0 && (
          <div>
            <h3 className="text-3xl font-serif italic font-black text-slate-800 mb-6 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
              <span className="text-4xl text-blue-700">Rx</span> 
            </h3>
            <ul className="space-y-6 px-2">
              {props.medicines.map((med, i) => (
                <li key={i} className="relative pr-4 border-r-2 border-slate-200 hover:border-blue-400 transition-colors">
                  {/* السطر الأول: الاسم والتركيز والشكل */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-xl font-black text-slate-900">● {med.name}</p>
                    <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                       {med.concentration}
                    </span>
                    <span className="text-xs font-medium text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md">
                       {med.form}
                    </span>
                  </div>
                  
                  {/* السطر الثاني: التفاصيل الكاملة */}
                  <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-700 items-center">
                     {med.frequency && <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-blue-800"><Activity className="w-3 h-3"/> {med.frequency}</span>}
                     {med.duration && <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-green-800"><Calendar className="w-3 h-3"/> لمدة {med.duration}</span>}
                     {med.relation && <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded text-orange-800"><Pill className="w-3 h-3"/> {med.relation}</span>}
                  </div>

                  {/* ملاحظات الدواء */}
                  {med.notes && (
                    <p className="text-xs text-red-600 mt-1 font-bold">
                       * ملاحظة: {med.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. Tests & Imaging (التحاليل والأشعة) */}
        {(props.tests.length > 0 || props.imaging.length > 0) && (
          <div className="grid grid-cols-2 gap-8 mt-8 border-t border-dashed border-slate-300 pt-6">
             {props.tests.length > 0 && (
               <div className="bg-slate-50 p-4 rounded-xl">
                  <h3 className="text-sm font-black text-slate-800 mb-3 border-b pb-2">التحاليل المطلوبة (Lab Tests)</h3>
                  <ul className="list-disc list-inside text-sm font-bold text-slate-600 space-y-2">
                    {props.tests.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
               </div>
             )}
             {props.imaging.length > 0 && (
               <div className="bg-slate-50 p-4 rounded-xl">
                  <h3 className="text-sm font-black text-slate-800 mb-3 border-b pb-2">الأشعة المطلوبة (Radiology)</h3>
                  <ul className="list-disc list-inside text-sm font-bold text-slate-600 space-y-2">
                    {props.imaging.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
               </div>
             )}
          </div>
        )}

        {/* 6. Health Messages (التثقيف الصحي) */}
        {props.healthMessages.length > 0 && (
          <div className="mt-6 p-5 border border-green-200 rounded-xl bg-green-50/40">
             <h3 className="text-base font-black text-green-800 mb-3 flex items-center gap-2">
               تعليمات هامة للمريض:
             </h3>
             <ul className="list-decimal list-inside text-sm font-bold text-slate-700 space-y-2 leading-relaxed">
               {props.healthMessages.map((msg, i) => <li key={i}>{msg}</li>)}
             </ul>
          </div>
        )}

        {/* 7. General Notes */}
        {props.notes && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="font-bold text-slate-500 text-sm block mb-1">ملاحظات إضافية:</span>
            <p className="text-slate-700 text-sm leading-relaxed">{props.notes}</p>
          </div>
        )}
      </div>

      {/* 8. Footer (الفوتر والتوقيع) */}
      <div className="mt-auto pt-6 border-t-4 border-blue-900">
         <div className="flex justify-between items-end">
            
            {/* موعد الإعادة */}
            <div className="bg-slate-100 px-5 py-3 rounded-xl border border-slate-300 shadow-sm">
               <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Next Visit</p>
               <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600"/>
                  <span className="font-black text-lg text-slate-900">
                    {props.followUpDate ? new Date(props.followUpDate).toLocaleDateString('ar-EG') : 'حسب الحاجة'}
                  </span>
               </div>
            </div>

            {/* التوقيع */}
            <div className="text-center w-48">
               <div className="h-16 border-b border-slate-800 mb-2"></div>
               <p className="font-bold text-slate-800 text-sm">توقيع الطبيب / Doctor's Signature</p>
            </div>
         </div>

         {/* معلومات الاتصال */}
         <div className="mt-6 flex justify-center gap-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Cairo, Egypt</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> 19xxx Hotline</span>
            <span className="flex items-center gap-1"><Activity className="w-3 h-3"/> www.smart-clinic.com</span>
         </div>
      </div>

    </div>
  );
});

PrescriptionView.displayName = 'PrescriptionView';

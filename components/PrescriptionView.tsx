import React, { forwardRef } from 'react';
import { Stethoscope, Phone, MapPin } from 'lucide-react';

interface PrescriptionProps {
  doctorName?: string;
  patientName: string;
  date: string;
  diagnosis: string;
  medicines: any[];
  tests: string[];
  imaging: string[];
  healthMessages: string[];
  notes: string;
  centerName?: string;
}

export const PrescriptionView = forwardRef<HTMLDivElement, PrescriptionProps>((props, ref) => {
  return (
    <div ref={ref} className="bg-white text-black font-cairo mx-auto my-8 shadow-2xl overflow-hidden relative print:shadow-none print:m-0" style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>
      
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-blue-800 mb-2">{props.centerName || 'المركز الطبي الذكي'}</h1>
          <div className="flex items-center gap-2 text-slate-600 font-bold">
            <Stethoscope className="w-5 h-5"/>
            <span>د. {props.doctorName || 'طبيب عام'}</span>
          </div>
        </div>
        <div className="text-left">
           <p className="text-sm text-slate-500 font-bold">التاريخ / Date</p>
           <p className="text-xl font-mono font-bold">{props.date}</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 flex justify-between items-center">
         <div>
            <span className="text-slate-500 text-sm font-bold ml-2">اسم المريض:</span>
            <span className="text-xl font-bold text-slate-800">{props.patientName}</span>
         </div>
         <div>
            <span className="text-slate-500 text-sm font-bold ml-2">التشخيص:</span>
            <span className="text-lg font-bold text-blue-700">{props.diagnosis}</span>
         </div>
      </div>

      {/* Body */}
      <div className="space-y-8 min-h-[500px]">
        
        {/* R/x Medicines */}
        {props.medicines.length > 0 && (
          <div>
            <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2 border-b w-fit pb-1 px-2">
              <span className="text-4xl italic font-serif text-blue-600 mr-2">Rx</span> الأدوية العلاجية
            </h3>
            <ul className="space-y-4 list-decimal list-inside px-4">
              {props.medicines.map((med, i) => (
                <li key={i} className="text-lg font-bold text-slate-800">
                  {med.name} <span className="text-sm text-slate-500 font-normal">({med.concentration} - {med.form})</span>
                  <p className="mr-6 text-sm text-slate-600 mt-1 font-medium bg-slate-100 w-fit px-3 py-1 rounded-full">
                     {med.frequency} لمدة {med.duration} - {med.relation}
                  </p>
                  {med.notes && <p className="mr-6 text-xs text-red-500 mt-1"> * {med.notes}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tests & Imaging */}
        {(props.tests.length > 0 || props.imaging.length > 0) && (
          <div className="grid grid-cols-2 gap-8">
             {props.tests.length > 0 && (
               <div>
                  <h3 className="text-lg font-black text-slate-700 mb-3 border-b pb-1">التحاليل المطلوبة</h3>
                  <ul className="list-disc list-inside text-sm font-bold text-slate-600 space-y-1">
                    {props.tests.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
               </div>
             )}
             {props.imaging.length > 0 && (
               <div>
                  <h3 className="text-lg font-black text-slate-700 mb-3 border-b pb-1">الأشعة المطلوبة</h3>
                  <ul className="list-disc list-inside text-sm font-bold text-slate-600 space-y-1">
                    {props.imaging.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
               </div>
             )}
          </div>
        )}

        {/* Health Advice */}
        {props.healthMessages.length > 0 && (
          <div className="mt-8 bg-green-50 p-6 rounded-xl border border-green-100 print:bg-transparent print:border-slate-200">
             <h3 className="text-lg font-black text-green-800 mb-3 flex items-center gap-2">
               تعليمات طبية وتثقيف صحي
             </h3>
             <ul className="list-disc list-inside text-slate-700 font-medium space-y-2">
               {props.healthMessages.map((msg, i) => <li key={i}>{msg}</li>)}
             </ul>
          </div>
        )}

        {/* Notes */}
        {props.notes && (
          <div className="mt-6 pt-4 border-t border-dashed">
            <span className="font-bold text-slate-500 text-sm">ملاحظات:</span>
            <p className="text-slate-700 mt-1">{props.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-10 left-10 right-10 border-t-2 border-slate-200 pt-4 flex justify-between items-end">
         <div className="text-sm text-slate-500">
           <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> القاهرة، مصر - شارع التسعين</p>
           <p className="flex items-center gap-2 mt-1"><Phone className="w-4 h-4"/> 19xxx - 010xxxxxxx</p>
         </div>
         <div className="text-center">
            <div className="h-16 w-32 border-b border-slate-300 mb-2"></div>
            <p className="font-bold text-slate-700">توقيع الطبيب</p>
         </div>
      </div>

    </div>
  );
});

PrescriptionView.displayName = 'PrescriptionView';

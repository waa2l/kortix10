'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // نحتاج معرف المريض أولاً
    const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single();
    if(!patient) return;

    const { data } = await supabase
      .from('appointments')
      .select('*, clinic:clinics(clinic_name), doctor:doctors(full_name)')
      .eq('patient_id', patient.id)
      .order('appointment_date', { ascending: false }); // الأحدث أولاً

    if (data) setAppointments(data);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'scheduled': return 'مؤكد / قادم';
      case 'completed': return 'تمت الزيارة';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
           <Calendar className="w-6 h-6 text-blue-600"/> مواعيدي
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-10">جاري التحميل...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
           <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
           <p className="text-slate-500">لا توجد مواعيد مسجلة</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((app) => (
            <div key={app.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
               
               <div className="flex items-start gap-4 w-full">
                  <div className="bg-blue-50 p-3 rounded-lg text-center min-w-[80px]">
                     <span className="block text-2xl font-bold text-blue-700">
                        {new Date(app.appointment_date).getDate()}
                     </span>
                     <span className="text-xs text-blue-500 font-bold uppercase">
                        {new Date(app.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
                     </span>
                  </div>
                  
                  <div>
                     <h3 className="font-bold text-lg text-slate-800 mb-1">{app.clinic?.clinic_name}</h3>
                     <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                        <User className="w-4 h-4"/> د. {app.doctor?.full_name || 'غير محدد'}
                     </p>
                     <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-4 h-4"/> {app.appointment_time} {app.shift && `(${app.shift})`}
                     </p>
                  </div>
               </div>

               <div className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${getStatusColor(app.status)}`}>
                  {getStatusText(app.status)}
               </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

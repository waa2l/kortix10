'use client';

import { useState, useEffect, useRef } from 'react';
import { useClinics, useSettings } from '@/lib/hooks';
import { User, Activity, Clock, Bell, Volume2, Search, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { toArabicNumbers, getArabicDate, playAudio } from '@/lib/utils';

export default function PatientPage() {
  const { clinics, loading } = useClinics();
  const { settings } = useSettings();
  
  // States للمتابعة
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [myTicketNumber, setMyTicketNumber] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [notification, setNotification] = useState<{ type: 'info' | 'warning' | 'success', message: string } | null>(null);
  
  // Ref لمنع تكرار الصوت لنفس الرقم
  const lastAnnouncedNumberRef = useRef<number>(-1);

  // --- Logic ---

  // دالة بدء التتبع (مهمة لتفعيل الصوت في المتصفح)
  const handleStartTracking = () => {
    if (!selectedClinicId || !myTicketNumber) return;
    setIsTracking(true);
    
    // خدعة لتفعيل الصوت: تشغيل ملف صامت أو قصير جداً عند ضغط الزر
    // هذا يسمح للمتصفح بتشغيل الأصوات لاحقاً بدون تدخل المستخدم
    playAudio('/audio/ding.mp3').then(() => {
        // Stop immediately just to unlock audio context
    }).catch(() => {});
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setNotification(null);
    lastAnnouncedNumberRef.current = -1;
  };

  // مراقبة الوضع الحالي
  useEffect(() => {
    if (!isTracking || !selectedClinicId) return;

    const clinic = clinics.find(c => c.id === selectedClinicId);
    if (!clinic) return;

    const myNum = parseInt(myTicketNumber);
    const currentNum = clinic.current_number;
    const diff = myNum - currentNum;

    // منطق التنبيهات
    if (currentNum >= myNum) {
      // حان الدور (أو فات)
      if (lastAnnouncedNumberRef.current !== currentNum) {
        setNotification({ type: 'success', message: 'حان دورك الآن! يرجى الدخول للعيادة' });
        // تشغيل صوت وتنبيه
        playAudio('/audio/ding.mp3');
        // يمكن إضافة نطق هنا إذا توفرت المكتبة، حالياً نكتفي بالـ ding القوي
        lastAnnouncedNumberRef.current = currentNum;
      }
    } else if (diff <= 3 && diff > 0) {
      // اقترب الدور
      if (notification?.type !== 'warning') {
        setNotification({ type: 'warning', message: `استعد! يتبقى ${toArabicNumbers(diff)} عملاء فقط أمامك` });
        playAudio('/audio/ding.mp3'); // تنبيه خفيف
      }
    } else {
      // لا يزال الانتظار
      setNotification({ type: 'info', message: 'يرجى الانتظار في الاستراحة' });
    }

  }, [clinics, isTracking, selectedClinicId, myTicketNumber, notification?.type]);


  // --- Render Helpers ---
  const selectedClinicData = clinics.find(c => c.id === selectedClinicId);
  const turnsRemaining = selectedClinicData ? parseInt(myTicketNumber) - selectedClinicData.current_number : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-cairo text-slate-800 pb-20">
      
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-lg rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{settings?.center_name || 'المركز الطبي'}</h1>
            <p className="text-blue-100 text-sm opacity-90">{getArabicDate(new Date())}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
        {!isTracking && (
          <p className="text-blue-50 text-sm">أدخل بياناتك لمتابعة دورك وتلقي التنبيهات</p>
        )}
      </header>

      <main className="p-6 -mt-6">
        
        {/* === حالة التتبع (Tracking Mode) === */}
        {isTracking && selectedClinicData ? (
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 border-t-8 transition-all duration-500 ${
              turnsRemaining <= 0 ? 'border-green-500 shadow-green-100' : 
              turnsRemaining <= 3 ? 'border-amber-500 shadow-amber-100' : 'border-blue-500 shadow-blue-100'
            }`}>
              
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedClinicData.clinic_name}</h2>
                  <p className="text-slate-500 text-sm">تذكرتك رقم: <span className="font-bold text-slate-800">{toArabicNumbers(myTicketNumber)}</span></p>
                </div>
                {turnsRemaining <= 0 ? <CheckCircle className="w-8 h-8 text-green-500 animate-pulse"/> : 
                 turnsRemaining <= 3 ? <AlertTriangle className="w-8 h-8 text-amber-500 animate-bounce"/> :
                 <Activity className="w-8 h-8 text-blue-500"/>}
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                 {turnsRemaining > 0 ? (
                   <>
                     <p className="text-slate-400 text-sm mb-2">الدور الحالي بالعيادة</p>
                     <p className="text-7xl font-black text-slate-800 mb-6">{toArabicNumbers(selectedClinicData.current_number)}</p>
                     
                     <div className="bg-slate-50 rounded-xl p-4 w-full flex justify-between items-center">
                        <span className="text-slate-600 font-bold">أمامك:</span>
                        <span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-lg font-bold">{toArabicNumbers(turnsRemaining)}</span>
                     </div>
                   </>
                 ) : (
                   <div className="text-center py-6">
                     <p className="text-4xl font-bold text-green-600 mb-2">حان دورك!</p>
                     <p className="text-slate-500">يرجى التوجه للعيادة فوراً</p>
                   </div>
                 )}
              </div>

              {/* Notification Message */}
              {notification && (
                <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                  notification.type === 'success' ? 'bg-green-100 text-green-800' :
                  notification.type === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-800'
                }`}>
                  <Bell className="w-5 h-5 shrink-0" />
                  <p className="font-bold text-sm">{notification.message}</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleStopTracking}
              className="w-full bg-slate-200 text-slate-700 py-4 rounded-xl font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              إلغاء المتابعة
            </button>

          </div>
        ) : (
          /* === وضع الإدخال (Input Mode) === */
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            
            <div className="space-y-2">
              <label className="text-slate-700 font-bold block">اختر العيادة</label>
              <div className="relative">
                <Search className="absolute right-3 top-3.5 text-slate-400 w-5 h-5" />
                <select 
                  value={selectedClinicId} 
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 appearance-none outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                >
                  <option value="">-- اضغط للاختيار --</option>
                  {clinics.filter(c => c.is_active).map(clinic => (
                    <option key={clinic.id} value={clinic.id}>{clinic.clinic_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 font-bold block">رقم التذكرة</label>
              <div className="relative">
                <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-100 rounded-r-xl border border-slate-200 text-slate-500 font-bold">#</div>
                <input 
                  type="number" 
                  value={myTicketNumber}
                  onChange={(e) => setMyTicketNumber(e.target.value)}
                  placeholder="مثال: 45"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-14 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-mono text-lg"
                />
              </div>
            </div>

            <button 
              onClick={handleStartTracking}
              disabled={!selectedClinicId || !myTicketNumber}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              <span>بدء المتابعة</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
               <Volume2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
               <p className="text-xs text-blue-800 leading-relaxed">
                 عند تفعيل المتابعة، سيقوم هاتفك بإصدار تنبيه صوتي عندما يقترب دورك. يرجى إبقاء هذه الصفحة مفتوحة.
               </p>
            </div>

          </div>
        )}

        {/* باقي العيادات (للاطلاع العام) */}
        {!isTracking && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-700 mb-4 px-2 border-r-4 border-blue-500 mr-2">حالة العيادات الآن</h3>
            <div className="grid gap-3">
              {clinics.map(clinic => (
                <div key={clinic.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${clinic.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-bold text-slate-700">{clinic.clinic_name}</span>
                  </div>
                  <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-400 ml-2">الدور:</span>
                    <span className="font-black text-blue-600 text-lg">{toArabicNumbers(clinic.current_number)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

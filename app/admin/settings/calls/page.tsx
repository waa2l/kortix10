'use client';

import { useState, useEffect, useRef } from 'react';
import { useClinics, useQueue } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { 
  Play, RotateCcw, AlertTriangle, Send, Pause, Bell, 
  MessageSquare, X, ArrowRightLeft, Clock, Mic, StopCircle, 
  Stethoscope, Activity, Radio, Volume2, Square
} from 'lucide-react';
import { toArabicNumbers, playSequentialAudio, getArabicDate, getArabicTime, playAudio } from '@/lib/utils';

// قائمة الملفات الصوتية الجاهزة
const INSTANT_AUDIO_FILES = [
  { label: 'تنبيه إداري 1', file: 'instant1.mp3' },
  { label: 'تنبيه إداري 2', file: 'instant2.mp3' },
  { label: 'تنبيه إداري 3', file: 'instant3.mp3' },
];

export default function AdminCallsPage() {
  
  // Hooks
  const { clinics, loading: clinicsLoading, updateClinic } = useClinics();
  const { addToQueue } = useQueue();
  
  // States
  const [isClient, setIsClient] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState(''); 
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Notification State
  const [notification, setNotification] = useState<{ show: boolean; message: string; type?: 'normal' | 'emergency' | 'message' | 'transfer' } | null>(null);
  
  // Inputs State
  const [specialCallNumber, setSpecialCallNumber] = useState('');
  const [patientName, setPatientName] = useState(''); 
  const [selectedInstantFile, setSelectedInstantFile] = useState(INSTANT_AUDIO_FILES[0].file);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Emergency Loop State
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const emergencyAudioRef = useRef<HTMLAudioElement | null>(null);

  // Modals State
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Modal Data
  const [msgTargetClinic, setMsgTargetClinic] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [transferTargetClinic, setTransferTargetClinic] = useState('');

  const prevClinicsRef = useRef<typeof clinics>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Audio Helpers ---
  const getFullAudioFiles = (ticketNumber: number, clinicNumber: number) => {
    return ['/audio/ding.mp3', `/audio/${ticketNumber}.mp3`, `/audio/clinic${clinicNumber}.mp3`];
  };

  const triggerAdminAlert = async (message: string, type: 'normal' | 'emergency' | 'message' | 'transfer' = 'normal', audioFiles: string[] = []) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(null), 3000);
    if (audioFiles.length > 0) {
      try { await playSequentialAudio(audioFiles); } catch (e) { console.error("Audio error", e); }
    }
  };

  // --- Instant Audio Handler ---
  const handlePlayInstantAudio = async () => {
    if (!selectedInstantFile) return;
    
    try {
      const channel = supabase.channel('control-alerts');
      await channel.send({
        type: 'broadcast',
        event: 'play-instant',
        payload: { file: selectedInstantFile }
      });
      
      triggerAdminAlert('تم بث الملف الصوتي', 'normal', [`/audio/${selectedInstantFile}`]);
    } catch (err) { alert('فشل البث'); }
  };

  // --- Voice Recording Handlers ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          // Send via Supabase
          const channel = supabase.channel('control-alerts');
          await channel.send({
            type: 'broadcast',
            event: 'voice-broadcast',
            payload: { audioData: base64Audio }
          });
          triggerAdminAlert('تم إرسال الرسالة الصوتية', 'message', ['/audio/ding.mp3']);
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer & Auto-stop at 10s
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            stopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      alert('لا يمكن الوصول للمايكروفون');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // --- Handlers (Standard) ---
  const handleNextPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinicId);
    if (clinic && clinic.is_active) {
      const nextNumber = clinic.current_number + 1;
      try {
        await updateClinic(clinic.id, { current_number: nextNumber, last_call_time: new Date().toISOString() });
        triggerAdminAlert(`تم نداء رقم ${toArabicNumbers(nextNumber)} - ${clinic.clinic_name}`, 'normal', getFullAudioFiles(nextNumber, clinic.clinic_number));
      } catch (err) { triggerAdminAlert('فشل التحديث', 'normal', ['/audio/ding.mp3']); }
    } else { triggerAdminAlert('العيادة متوقفة حالياً', 'normal', ['/audio/ding.mp3']); }
  };

  const handlePreviousPatient = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinicId);
    if (clinic && clinic.current_number > 0) {
      const prevNumber = clinic.current_number - 1;
      try {
        await updateClinic(clinic.id, { current_number: prevNumber });
        triggerAdminAlert(`تم الرجوع لرقم ${toArabicNumbers(prevNumber)}`, 'normal', getFullAudioFiles(prevNumber, clinic.clinic_number));
      } catch (err) { alert('فشل التحديث'); }
    }
  };

  const handleRepeatCall = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinicId);
    if (clinic && clinic.current_number > 0) {
       try {
         await updateClinic(clinic.id, { last_call_time: new Date().toISOString() });
         triggerAdminAlert(`تكرار نداء رقم ${toArabicNumbers(clinic.current_number)}`, 'normal', getFullAudioFiles(clinic.current_number, clinic.clinic_number));
       } catch (err) { alert('فشل التحديث'); }
    }
  };

  const handleSpecialCall = async () => {
    if (!specialCallNumber) return;
    const targetNum = parseInt(specialCallNumber);
    const clinic = clinics.find((c) => c.id === selectedClinicId);
    if (clinic) {
      try {
        await updateClinic(clinic.id, { current_number: targetNum, last_call_time: new Date().toISOString() });
        triggerAdminAlert(`نداء خاص لرقم ${toArabicNumbers(targetNum)}`, 'normal', getFullAudioFiles(targetNum, clinic.clinic_number));
        setSpecialCallNumber('');
      } catch (err) { alert('فشل النداء الخاص'); }
    }
  };

  const handleNameAlert = async () => {
    if (!patientName) return;
    const clinic = clinics.find(c => c.id === selectedClinicId);
    try {
      const channel = supabase.channel('control-alerts');
      await channel.send({ type: 'broadcast', event: 'name-alert', payload: { name: patientName, clinicName: clinic?.clinic_name || 'العيادة' } });
      triggerAdminAlert(`جاري نداء: ${patientName}`, 'normal', ['/audio/ding.mp3']);
      setPatientName(''); 
    } catch (err) { alert('فشل الإرسال'); }
  };

  const handleTransferCurrent = async () => {
    if (!transferTargetClinic) return;
    const currentClinic = clinics.find(c => c.id === selectedClinicId);
    const targetClinicObj = clinics.find(c => c.id === transferTargetClinic);
    if (currentClinic && targetClinicObj) {
      try {
        const channel = supabase.channel('control-alerts');
        await channel.send({
          type: 'broadcast', event: 'clinic-transfer',
          payload: { ticketNumber: currentClinic.current_number, fromClinicId: currentClinic.id, toClinicId: targetClinicObj.id, toClinicName: targetClinicObj.clinic_name, toClinicNumber: targetClinicObj.clinic_number }
        });
        triggerAdminAlert(`تم التحويل إلى ${targetClinicObj.clinic_name}`, 'transfer', ['/audio/ding.mp3']);
        setShowTransferModal(false); setTransferTargetClinic('');
      } catch (err) { alert('فشل التحويل'); }
    }
  };

  const handleEmergencyToggle = async () => {
    if (isEmergencyActive) {
      if (emergencyAudioRef.current) { emergencyAudioRef.current.pause(); emergencyAudioRef.current.currentTime = 0; }
      setIsEmergencyActive(false); setNotification(null); return;
    }
    if (confirm('تأكيد نداء الطوارئ؟')) {
      const clinic = clinics.find((c) => c.id === selectedClinicId);
      if (clinic) {
        try {
          await addToQueue({ clinic_id: clinic.id, ticket_number: clinic.current_number, status: 'called', is_emergency: true, patient_id: null, called_at: new Date().toISOString(), completed_at: null });
          setIsEmergencyActive(true); setNotification({ show: true, message: '⚠️ نداء الطوارئ مفعل ⚠️', type: 'emergency' });
          if (!emergencyAudioRef.current) { emergencyAudioRef.current = new Audio('/audio/emergency.mp3'); emergencyAudioRef.current.loop = true; }
          emergencyAudioRef.current.play().catch(e => console.error("Emergency play error", e));
        } catch (err) { alert('فشل إرسال نداء الطوارئ'); }
      }
    }
  };

  useEffect(() => { return () => { if (emergencyAudioRef.current) { emergencyAudioRef.current.pause(); } }; }, []);

  const handleSendTextAlert = async () => {
    if (!msgTargetClinic || !msgContent) return;
    const currentClinic = clinics.find(c => c.id === selectedClinicId);
    try {
      const channel = supabase.channel('control-alerts');
      await channel.send({ type: 'broadcast', event: 'clinic-message', payload: { targetClinicId: msgTargetClinic, senderName: currentClinic?.clinic_name || 'الإدارة', message: msgContent } });
      setShowMsgModal(false); setMsgContent(''); triggerAdminAlert('تم إرسال الرسالة', 'normal', ['/audio/ding.mp3']);
    } catch (err) { alert('فشل الإرسال'); }
  };

  const handleReset = async () => {
    if (confirm('تصفير العداد لهذه العيادة؟')) {
      const clinic = clinics.find((c) => c.id === selectedClinicId);
      if (clinic) { await updateClinic(clinic.id, { current_number: 0, last_call_time: null }); triggerAdminAlert('تم تصفير العداد', 'normal', ['/audio/ding.mp3']); }
    }
  };

  const handleToggleActive = async () => {
    const clinic = clinics.find((c) => c.id === selectedClinicId);
    if (clinic) {
      await updateClinic(clinic.id, { is_active: !clinic.is_active });
      triggerAdminAlert(`تم ${!clinic.is_active ? 'تفعيل' : 'إيقاف'} العيادة`, 'normal', ['/audio/ding.mp3']);
    }
  };

  if (!isClient || clinicsLoading) return <div className="p-8 text-center"><div className="spinner border-blue-600"></div></div>;
  const selectedClinic = clinics.find((c) => c.id === selectedClinicId);

  return (
    <div className="space-y-6 font-cairo">
      
      {/* 1. Header & Clinic Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-blue-600"/>
              التحكم في النداءات
            </h1>
            <p className="text-slate-500 text-sm mt-1">لوحة تحكم المدير بجميع العيادات</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">{getArabicTime(currentTime)}</span>
             </div>
             <select value={selectedClinicId} onChange={(e) => setSelectedClinicId(e.target.value)} className="flex-1 md:w-64 px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700">
               <option value="">-- اختر العيادة للتحكم --</option>
               {clinics.map((c) => (
                 <option key={c.id} value={c.id}>{c.clinic_name} {c.is_active ? '' : '(متوقفة)'}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      {/* 2. Notification Bar */}
      <div className={`fixed top-0 left-0 w-full z-[100] transform transition-transform duration-300 ${notification ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`p-4 shadow-lg flex items-center justify-center gap-3 ${notification?.type === 'emergency' ? 'bg-red-600' : notification?.type === 'message' ? 'bg-purple-600' : notification?.type === 'transfer' ? 'bg-indigo-600' : 'bg-green-600'} text-white`}>
          <Bell className="w-6 h-6 animate-bounce" />
          <p className="text-xl font-bold">{notification?.message}</p>
        </div>
      </div>

      {/* 3. Main Control Panel */}
      {selectedClinic ? (
        <>
          {/* Status Bar */}
          <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between">
             <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${selectedClinic.is_active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                <div>
                   <h2 className="text-2xl font-bold">{selectedClinic.clinic_name}</h2>
                   <p className="text-slate-400 text-sm">{selectedClinic.is_active ? 'العيادة نشطة وتستقبل العملاء' : 'العيادة متوقفة حالياً'}</p>
                </div>
             </div>
             <div className="mt-4 md:mt-0 bg-slate-700/50 px-6 py-3 rounded-lg text-center border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">الرقم الحالي</p>
                <p className="text-4xl font-black text-blue-400">{toArabicNumbers(selectedClinic.current_number)}</p>
             </div>
          </div>

          {/* Control Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={handleNextPatient} disabled={!selectedClinic.is_active} className="bg-white hover:bg-green-50 border-b-4 border-green-600 p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 transition-transform active:scale-95 group disabled:opacity-50">
              <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors"><Play className="w-8 h-8 text-green-700" /></div>
              <span className="text-xl font-bold text-slate-700">العميل التالي</span>
            </button>
            <button onClick={handlePreviousPatient} disabled={!selectedClinic.is_active} className="bg-white hover:bg-blue-50 border-b-4 border-blue-600 p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 transition-transform active:scale-95 group disabled:opacity-50">
              <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors"><RotateCcw className="w-8 h-8 text-blue-700" /></div>
              <span className="text-xl font-bold text-slate-700">العميل السابق</span>
            </button>
            <button onClick={handleRepeatCall} disabled={!selectedClinic.is_active} className="bg-white hover:bg-purple-50 border-b-4 border-purple-600 p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 transition-transform active:scale-95 group disabled:opacity-50">
              <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors"><Bell className="w-8 h-8 text-purple-700" /></div>
              <span className="text-xl font-bold text-slate-700">تكرار النداء</span>
            </button>
            <button onClick={() => setShowTransferModal(true)} disabled={!selectedClinic.is_active} className="bg-white hover:bg-indigo-50 border-b-4 border-indigo-600 p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 transition-transform active:scale-95 group disabled:opacity-50">
              <div className="bg-indigo-100 p-3 rounded-full group-hover:bg-indigo-200 transition-colors"><ArrowRightLeft className="w-8 h-8 text-indigo-700" /></div>
              <span className="text-xl font-bold text-slate-700">تحويل العميل</span>
            </button>
            <button onClick={handleToggleActive} className="bg-white hover:bg-yellow-50 border-b-4 border-yellow-600 p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 transition-transform active:scale-95 group">
              <div className="bg-yellow-100 p-3 rounded-full group-hover:bg-yellow-200 transition-colors"><Pause className="w-8 h-8 text-yellow-700" /></div>
              <span className="text-xl font-bold text-slate-700">{selectedClinic.is_active ? 'إيقاف العيادة' : 'استئناف العيادة'}</span>
            </button>
            <button onClick={handleReset} className="bg-white hover:bg-orange-50 border-b-4 border-orange-600 p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 transition-transform active:scale-95 group">
              <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors"><RotateCcw className="w-8 h-8 text-orange-700" /></div>
              <span className="text-xl font-bold text-slate-700">تصفير العداد</span>
            </button>
            <button onClick={handleEmergencyToggle} className={`${isEmergencyActive ? 'bg-gray-800 hover:bg-gray-700 border-gray-900 text-white' : 'bg-red-50 hover:bg-red-100 border-red-600 text-red-700'} border-b-4 p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 transition-transform active:scale-95 col-span-1 md:col-span-2 lg:col-span-3 ${isEmergencyActive ? '' : 'animate-pulse'}`}>
              {isEmergencyActive ? <StopCircle className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
              <span className="text-xl font-bold">{isEmergencyActive ? 'إيقاف صوت الطوارئ' : 'نداء طوارئ (تنبيه عام)'}</span>
            </button>
          </div>

          {/* New: Audio Broadcasting Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* 1. بث ملف صوتي جاهز */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><Radio className="w-5 h-5 text-indigo-500"/> بث ملف صوتي جاهز</h3>
              <div className="flex gap-2">
                <select value={selectedInstantFile} onChange={(e) => setSelectedInstantFile(e.target.value)} className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 outline-none">
                  {INSTANT_AUDIO_FILES.map(file => (
                    <option key={file.file} value={file.file}>{file.label}</option>
                  ))}
                </select>
                <button onClick={handlePlayInstantAudio} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                  <Play className="w-4 h-4" /> تشغيل
                </button>
              </div>
            </div>

            {/* 2. بث صوتي مباشر (تسجيل) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><Mic className="w-5 h-5 text-red-500"/> بث صوتي مباشر (10 ثواني)</h3>
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button onClick={startRecording} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                    <Mic className="w-4 h-4" /> ابدأ التسجيل
                  </button>
                ) : (
                  <button onClick={stopRecording} className="flex-1 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors animate-pulse">
                    <Square className="w-4 h-4 fill-white" /> إيقاف ({recordingTime}s)
                  </button>
                )}
                {isRecording && <div className="text-red-500 font-mono font-bold">{recordingTime}/10s</div>}
              </div>
            </div>

          </div>

          {/* Tools Grid (Special Calls) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><Send className="w-5 h-5 text-blue-500"/> نداء برقم محدد</h3>
              <div className="flex gap-2">
                <input type="number" value={specialCallNumber} onChange={(e) => setSpecialCallNumber(e.target.value)} placeholder="رقم العميل" className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleSpecialCall} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold">نداء</button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><Mic className="w-5 h-5 text-green-500"/> نداء باسم العميل</h3>
              <div className="flex gap-2">
                <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="اسم العميل" className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 outline-none focus:ring-2 focus:ring-green-500" />
                <button onClick={handleNameAlert} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold">نداء</button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700"><MessageSquare className="w-5 h-5 text-purple-500"/> تنبيه نصي لعيادة</h3>
              <button onClick={() => setShowMsgModal(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold">كتابة رسالة</button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 text-slate-400">
           <Activity className="w-16 h-16 mb-4 opacity-20" />
           <p className="text-xl font-bold">يرجى اختيار عيادة من القائمة بالأعلى للتحكم بها</p>
        </div>
      )}

      {/* Modals (Hidden for brevity, same as before) */}
      {showMsgModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setShowMsgModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-red-500"><X /></button>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">إرسال تنبيه نصي</h2>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-600">إلى عيادة (أو شاشة):</label>
              <select value={msgTargetClinic} onChange={(e) => setMsgTargetClinic(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 outline-none">
                <option value="">-- اختر العيادة --</option>
                {clinics.filter(c => c.id !== selectedClinicId).map(c => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
              </select>
              <textarea value={msgContent} onChange={(e) => setMsgContent(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 outline-none" placeholder="اكتب الرسالة هنا..."></textarea>
              <button onClick={handleSendTextAlert} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-200">إرسال</button>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && selectedClinic && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-red-500"><X /></button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800"><ArrowRightLeft className="text-indigo-600"/> تحويل العميل الحالي</h2>
            <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-center border border-indigo-100">
              <p className="text-indigo-600 font-bold">العميل الحالي رقم</p>
              <p className="text-4xl font-black text-indigo-700 mt-2">{selectedClinic.current_number}</p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-600">تحويل إلى عيادة:</label>
              <select value={transferTargetClinic} onChange={(e) => setTransferTargetClinic(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 outline-none">
                <option value="">-- اختر العيادة --</option>
                {clinics.filter(c => c.id !== selectedClinicId).map(c => <option key={c.id} value={c.id}>{c.clinic_name}</option>)}
              </select>
              <button onClick={handleTransferCurrent} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg mt-4 shadow-lg shadow-indigo-200">تأكيد التحويل</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

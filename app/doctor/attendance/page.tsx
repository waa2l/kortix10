'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, CheckCircle, LogOut, Calendar } from 'lucide-react';
import { getArabicDate, getArabicTime } from '@/lib/utils';

export default function DoctorAttendance() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Get Logged-in Doctor ID
  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctorData');
    if (storedDoctor) {
      const { id } = JSON.parse(storedDoctor);
      setDoctorId(id);
      fetchAttendance(id);
    }
  }, []);

  // 2. Fetch Attendance Records
  const fetchAttendance = async (id: string) => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Get All Records
      const { data, error } = await supabase
        .from('doctor_attendance')
        .select('*')
        .eq('doctor_id', id)
        .order('attendance_date', { ascending: false });

      if (error) throw error;
      setAttendance(data || []);

      // Check Today's Record
      const todayEntry = data?.find((r: any) => r.attendance_date === today);
      setTodayRecord(todayEntry);

    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Check-In
  const handleCheckIn = async () => {
    if (!doctorId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('doctor_attendance')
        .insert([{
          doctor_id: doctorId,
          attendance_date: today,
          check_in_time: now,
          status: 'present'
        }]);

      if (error) throw error;
      alert('تم تسجيل الحضور بنجاح');
      fetchAttendance(doctorId);
    } catch (error: any) {
      alert('خطأ في تسجيل الحضور: ' + error.message);
    }
  };

  // 4. Handle Check-Out
  const handleCheckOut = async () => {
    if (!todayRecord) return;
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('doctor_attendance')
        .update({ check_out_time: now })
        .eq('id', todayRecord.id);

      if (error) throw error;
      alert('تم تسجيل الانصراف بنجاح');
      fetchAttendance(doctorId!);
    } catch (error: any) {
      alert('خطأ في تسجيل الانصراف: ' + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6 font-cairo">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Clock className="w-6 h-6 text-blue-600"/> سجل الحضور والانصراف
      </h1>

      {/* Today's Action Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-500"/> حالة اليوم: {getArabicDate(new Date())}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center py-4">
          {!todayRecord ? (
            <button onClick={handleCheckIn} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-3 transition-transform active:scale-95 shadow-lg shadow-green-100">
              <CheckCircle className="w-8 h-8" /> تسجيل حضور
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="bg-green-50 text-green-700 px-6 py-3 rounded-lg border border-green-200 w-full text-center">
                <p className="font-bold">تم تسجيل الحضور في: {new Date(todayRecord.check_in_time).toLocaleTimeString('ar-EG')}</p>
              </div>
              
              {!todayRecord.check_out_time ? (
                <button onClick={handleCheckOut} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-lg font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-100">
                  <LogOut className="w-6 h-6" /> تسجيل انصراف
                </button>
              ) : (
                <div className="bg-slate-100 text-slate-600 px-6 py-3 rounded-lg border border-slate-200 w-full text-center">
                  <p className="font-bold">تم الانصراف في: {new Date(todayRecord.check_out_time).toLocaleTimeString('ar-EG')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="p-4 bg-slate-50 font-bold border-b text-slate-700">سجل الأيام السابقة</h3>
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="p-4">التاريخ</th>
              <th className="p-4">وقت الحضور</th>
              <th className="p-4">وقت الانصراف</th>
              <th className="p-4">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id} className="border-t hover:bg-slate-50 text-sm">
                <td className="p-4 font-bold">{new Date(record.attendance_date).toLocaleDateString('ar-EG')}</td>
                <td className="p-4 text-green-600 font-mono font-bold">
                  {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('ar-EG') : '-'}
                </td>
                <td className="p-4 text-red-600 font-mono font-bold">
                  {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString('ar-EG') : '-'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {record.status === 'present' ? 'حاضر' : 'غائب'}
                  </span>
                </td>
              </tr>
            ))}
            {attendance.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">لا توجد سجلات سابقة</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

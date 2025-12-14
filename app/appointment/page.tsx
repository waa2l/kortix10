'use client';

import { useState, useEffect } from 'react';
import { useClinics, useAppointments } from '@/lib/hooks';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { isValidNationalId, isValidPhone } from '@/lib/utils';

export default function AppointmentBooking() {
  const { clinics, loading: clinicsLoading } = useClinics();
  const { addAppointment } = useAppointments();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    phone: '',
    clinic_id: '',
    appointment_date: '',
    appointment_time: '',
    shift: 'morning',
    visit_reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!formData.full_name || formData.full_name.length < 3) {
        throw new Error('يجب إدخال الاسم الكامل');
      }

      if (!isValidNationalId(formData.national_id)) {
        throw new Error('الرقم القومي يجب أن يكون 14 رقم');
      }

      if (!isValidPhone(formData.phone)) {
        throw new Error('رقم الهاتف غير صحيح');
      }

      if (!formData.clinic_id) {
        throw new Error('يجب اختيار عيادة');
      }

      if (!formData.appointment_date) {
        throw new Error('يجب اختيار تاريخ');
      }

      if (!formData.appointment_time) {
        throw new Error('يجب اختيار وقت');
      }

      // Check if date is in future
      const appointmentDate = new Date(formData.appointment_date);
      if (appointmentDate < new Date()) {
        throw new Error('يجب اختيار تاريخ في المستقبل');
      }

      // Submit appointment
      await addAppointment({
        patient_id: '', // Will be created or linked
        clinic_id: formData.clinic_id,
        doctor_id: null,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        shift: formData.shift,
        visit_reason: formData.visit_reason,
        status: 'scheduled',
      });

      setSuccess('تم حجز الموعد بنجاح! سيتم التواصل معك قريباً');
      setFormData({
        full_name: '',
        national_id: '',
        phone: '',
        clinic_id: '',
        appointment_date: '',
        appointment_time: '',
        shift: 'morning',
        visit_reason: '',
      });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في حجز الموعد');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || clinicsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const morningTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
  const eveningTimes = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
  const availableTimes = formData.shift === 'morning' ? morningTimes : eveningTimes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg rounded-lg mb-8 p-6">
        <div className="flex items-center gap-3 justify-center">
          <Calendar className="w-8 h-8" />
          <h1 className="text-3xl font-bold">حجز موعد</h1>
        </div>
        <p className="text-center text-blue-100 mt-2">احجز موعداً في العيادة</p>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم الكامل</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="أدخل الاسم الكامل"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* National ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الرقم القومي</label>
            <input
              type="text"
              name="national_id"
              value={formData.national_id}
              onChange={handleChange}
              placeholder="14 رقم"
              maxLength={14}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01001234567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Clinic Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اختر العيادة</label>
            <select
              name="clinic_id"
              value={formData.clinic_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- اختر عيادة --</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.clinic_name}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">التاريخ المطلوب</label>
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الفترة</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="shift"
                  value="morning"
                  checked={formData.shift === 'morning'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span>صباحي (8 ص - 2 م)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="shift"
                  value="evening"
                  checked={formData.shift === 'evening'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span>مسائي (2 م - 8 م)</span>
              </label>
            </div>
          </div>

          {/* Appointment Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الوقت المطلوب</label>
            <select
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- اختر وقت --</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Visit Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">سبب الزيارة</label>
            <textarea
              name="visit_reason"
              value={formData.visit_reason}
              onChange={handleChange}
              placeholder="أدخل سبب الزيارة"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              {loading ? 'جاري الحجز...' : 'حجز الموعد'}
            </button>
            <Link href="/patient" className="flex-1">
              <button
                type="button"
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </Link>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-gray-800 mb-3">ملاحظات مهمة:</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>✓ يتم حجز الموعد بناءً على التوفر</li>
            <li>✓ سيتم التواصل معك لتأكيد الموعد</li>
            <li>✓ يرجى الحضور قبل الموعد بـ 10 دقائق</li>
            <li>✓ في حالة عدم تمكنك من الحضور، يرجى إلغاء الموعد مسبقاً</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

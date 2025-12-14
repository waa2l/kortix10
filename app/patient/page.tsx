'use client';

import { useState, useEffect } from 'react';
import { useClinics, useQueue, usePatients } from '@/lib/hooks';
import { QrCode, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toArabicNumbers } from '@/lib/utils';

export default function PatientPage() {
  const { clinics, loading: clinicsLoading } = useClinics();
  const { queue } = useQueue();
  const { addPatient } = usePatients();
  const [isClient, setIsClient] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [complaintType, setComplaintType] = useState('complaint');
  const [complaintText, setComplaintText] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGetTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedClinic) {
      setError('يرجى اختيار عيادة');
      return;
    }

    // Generate ticket number
    const newTicket = Math.floor(Math.random() * 1000) + 1;
    setTicketNumber(newTicket.toString());
    setSuccess(`تم إصدار التذكرة رقم ${toArabicNumbers(newTicket)}`);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (complaintText.length < 10) {
      setError('يجب أن تكون الشكوى على الأقل 10 أحرف');
      return;
    }

    try {
      // Submit complaint to database
      setSuccess('تم إرسال الشكوى بنجاح');
      setComplaintText('');
      setShowComplaintForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('خطأ في إرسال الشكوى');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg rounded-lg mb-8 p-6">
        <h1 className="text-3xl font-bold text-center">صفحة العميل</h1>
        <p className="text-center text-blue-100 mt-2">تتبع الطابور والشكاوى</p>
      </header>

      <div className="max-w-4xl mx-auto">
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Get Ticket Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <QrCode className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">الحصول على تذكرة</h2>
            </div>

            <form onSubmit={handleGetTicket} className="space-y-6">
              {/* Clinic Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اختر العيادة</label>
                <select
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
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

              {/* Current Number Display */}
              {selectedClinic && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">الرقم الحالي في العيادة</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {toArabicNumbers(
                      clinics.find((c) => c.id === selectedClinic)?.current_number || 0
                    )}
                  </p>
                </div>
              )}

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-500 text-sm mt-1">لتلقي إشعار عند نداء رقمك</p>
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01001234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-500 text-sm mt-1">لتلقي رسالة WhatsApp عند نداء رقمك</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                الحصول على تذكرة
              </button>
            </form>

            {/* Ticket Display */}
            {ticketNumber && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-500">
                <p className="text-center text-gray-600 mb-2">رقم التذكرة</p>
                <p className="text-5xl font-bold text-center text-green-600">{toArabicNumbers(ticketNumber)}</p>
                <p className="text-center text-gray-600 mt-4">يرجى الانتظار حتى يتم نداء رقمك</p>
              </div>
            )}
          </div>

          {/* Complaint Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">الشكاوى والاقتراحات</h2>
            </div>

            {!showComplaintForm ? (
              <button
                onClick={() => setShowComplaintForm(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                تقديم شكوى أو اقتراح
              </button>
            ) : (
              <form onSubmit={handleSubmitComplaint} className="space-y-6">
                {/* Complaint Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الشكوى</label>
                  <select
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="complaint">شكوى</option>
                    <option value="suggestion">اقتراح</option>
                  </select>
                </div>

                {/* Complaint Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">النص (140 حرف على الأقل)</label>
                  <textarea
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder="أدخل الشكوى أو الاقتراح..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="text-gray-500 text-sm mt-1">{complaintText.length}/500</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    إرسال
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowComplaintForm(false);
                      setComplaintText('');
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/appointment">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">حجز موعد</h3>
              <p className="text-gray-600">احجز موعداً في العيادة</p>
            </div>
          </Link>

          <Link href="/consultation">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">استشارة طبية</h3>
              <p className="text-gray-600">اطلب استشارة من الطبيب</p>
            </div>
          </Link>

          <Link href="/calculators">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">حاسبات طبية</h3>
              <p className="text-gray-600">استخدم الأدوات الطبية</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

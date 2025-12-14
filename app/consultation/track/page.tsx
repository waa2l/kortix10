'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, AlertCircle } from 'lucide-react';

export default function ConsultationTrack() {
  const [nationalId, setNationalId] = useState('');
  const [consultationCode, setConsultationCode] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!nationalId || !consultationCode) {
      setError('يجب إدخال الرقم القومي ورقم الاستشارة');
      return;
    }

    // محاكاة البحث
    setSearched(true);
    setResult({
      code: consultationCode,
      patient_name: 'محمد أحمد علي',
      specialization: 'طب الأسرة',
      status: 'مفتوحة',
      created_at: '2025-12-11',
      complaint: 'آلام في الرأس',
      doctor_response: null,
      last_update: '2025-12-11 10:30',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg rounded-lg mb-8 p-6">
        <div className="flex items-center gap-3 justify-center">
          <Search className="w-8 h-8" />
          <h1 className="text-3xl font-bold">تتبع الاستشارة</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الرقم القومي</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="14 رقم"
                maxLength={14}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الاستشارة</label>
              <input
                type="text"
                value={consultationCode}
                onChange={(e) => setConsultationCode(e.target.value.toUpperCase())}
                placeholder="مثال: A106"
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              بحث
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && result && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">نتائج البحث</h2>

            {/* Status Badge */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-500">
              <span className="text-gray-700 font-semibold">حالة الاستشارة:</span>
              <span className={`px-4 py-2 rounded-full font-bold ${
                result.status === 'مفتوحة'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {result.status}
              </span>
            </div>

            {/* Consultation Details */}
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">رقم الاستشارة:</span>
                <span className="font-bold text-gray-800">{result.code}</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">الاسم:</span>
                <span className="font-bold text-gray-800">{result.patient_name}</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">التخصص:</span>
                <span className="font-bold text-gray-800">{result.specialization}</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">تاريخ الاستشارة:</span>
                <span className="font-bold text-gray-800">{result.created_at}</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">آخر تحديث:</span>
                <span className="font-bold text-gray-800">{result.last_update}</span>
              </div>
            </div>

            {/* Complaint */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">الشكوى:</h3>
              <p className="text-gray-700">{result.complaint}</p>
            </div>

            {/* Doctor Response */}
            {result.doctor_response ? (
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-500">
                <h3 className="font-bold text-green-800 mb-2">رد الطبيب:</h3>
                <p className="text-green-700">{result.doctor_response}</p>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-500">
                <p className="text-yellow-700">
                  ⏳ الاستشارة قيد المراجعة من قبل الطبيب المختص. سيتم الرد عليك قريباً.
                </p>
              </div>
            )}

            {/* Back Button */}
            <Link href="/consultation">
              <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors">
                العودة
              </button>
            </Link>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mt-8">
          <h3 className="font-bold text-gray-800 mb-3">ملاحظات مهمة:</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>✓ احفظ رقم الاستشارة لتتمكن من تتبعها</li>
            <li>✓ سيتم الرد على الاستشارة خلال 24 ساعة</li>
            <li>✓ يمكنك تتبع الاستشارة في أي وقت</li>
            <li>✓ سيتم إرسال إشعار عند الرد على الاستشارة</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useClinics } from '@/lib/hooks';
import { Printer, AlertCircle } from 'lucide-react';
import { toArabicNumbers, formatDate } from '@/lib/utils';

export default function PrintPage() {
  const { clinics, loading: clinicsLoading } = useClinics();
  const [isClient, setIsClient] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [fromNumber, setFromNumber] = useState('1');
  const [toNumber, setToNumber] = useState('10');
  const [error, setError] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    setError('');

    if (!selectedClinic) {
      setError('يرجى اختيار عيادة');
      return;
    }

    const from = parseInt(fromNumber);
    const to = parseInt(toNumber);

    if (from > to) {
      setError('الرقم الأول يجب أن يكون أقل من الرقم الثاني');
      return;
    }

    if (to - from > 100) {
      setError('لا يمكن طباعة أكثر من 100 تذكرة في المرة الواحدة');
      return;
    }

    // Trigger print
    window.print();
  };

  if (!isClient || clinicsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const clinic = clinics.find((c) => c.id === selectedClinic);
  const from = parseInt(fromNumber);
  const to = parseInt(toNumber);
  const tickets = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 no-print">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Printer className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">طباعة التذاكر</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Clinic Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اختر العيادة</label>
              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- اختر عيادة --</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.clinic_name}
                  </option>
                ))}
              </select>
            </div>

            {/* From Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">من رقم</label>
              <input
                type="number"
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* To Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">إلى رقم</label>
              <input
                type="number"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Print Button */}
            <div className="flex items-end">
              <button
                onClick={handlePrint}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                طباعة
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>عدد التذاكر: {tickets.length}</p>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket}
              className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300 text-center"
              style={{ width: '5cm', height: '5cm', pageBreakInside: 'avoid' }}
            >
              <p className="text-xs text-gray-600 mb-1">{clinic?.clinic_name}</p>
              <p className="text-3xl font-bold text-blue-600 my-2">{toArabicNumbers(ticket)}</p>
              <p className="text-xs text-gray-600">{formatDate(new Date())}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
          }
          .gap-4 {
            gap: 0 !important;
          }
          div[style*="5cm"] {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

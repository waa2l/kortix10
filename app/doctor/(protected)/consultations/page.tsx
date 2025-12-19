
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useConsultations, useMedicines, useTests, useImaging } from '@/lib/hooks';
import { ArrowRight, Reply, CheckCircle } from 'lucide-react';

export default function DoctorConsultations() {
  const { consultations } = useConsultations();
  const { medicines } = useMedicines();
  const { tests } = useTests();
  const { imaging } = useImaging();
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const handleReply = () => {
    if (response.trim()) {
      alert('تم إرسال الرد بنجاح');
      setResponse('');
      setSelectedMedicines([]);
      setSelectedTests([]);
      setSelectedConsultation(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/doctor/dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">الاستشارات</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultations List */}
          <div className="lg:col-span-2 space-y-4">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                onClick={() => setSelectedConsultation(consultation)}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                  selectedConsultation?.id === consultation.id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    consultation.status === 'open'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {consultation.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                  </span>
                </div>
                <p className="text-gray-800 font-semibold mb-2">{consultation.complaint_text}</p>
                <p className="text-gray-600 text-sm">{consultation.specialization}</p>
              </div>
            ))}
          </div>

          {/* Reply Panel */}
          {selectedConsultation && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Reply className="w-5 h-5" />
                الرد على الاستشارة
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الشكوى</label>
                  <p className="text-gray-800 text-sm">{selectedConsultation.complaint_text}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الأدوية</label>
                  <select
                    multiple
                    value={selectedMedicines}
                    onChange={(e) => setSelectedMedicines(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {medicines.map((med) => (
                      <option key={med.id} value={med.medicine_name}>
                        {med.medicine_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">التحاليل</label>
                  <select
                    multiple
                    value={selectedTests}
                    onChange={(e) => setSelectedTests(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tests.map((test) => (
                      <option key={test.id} value={test.test_name}>
                        {test.test_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الرد</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="أدخل الرد على الاستشارة"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleReply}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                إرسال الرد
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

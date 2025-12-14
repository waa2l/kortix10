'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquare, Reply } from 'lucide-react';

export default function ComplaintsSettings() {
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      type: 'شكوى',
      text: 'الانتظار طويل جداً',
      patient_name: 'محمد أحمد',
      phone: '01001234567',
      status: 'pending',
      created_at: '2025-12-11',
    },
    {
      id: 2,
      type: 'اقتراح',
      text: 'يجب إضافة مقاعد أكثر في الانتظار',
      patient_name: 'فاطمة علي',
      phone: '01101234567',
      status: 'pending',
      created_at: '2025-12-11',
    },
  ]);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [response, setResponse] = useState('');

  const handleReply = (id: number) => {
    if (response.trim()) {
      setComplaints(
        complaints.map((c) =>
          c.id === id ? { ...c, status: 'responded' } : c
        )
      );
      setResponse('');
      setSelectedComplaint(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowRight className="w-6 h-6 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">الشكاوى والاقتراحات</h1>
            <p className="text-gray-600 mt-1">عرض والرد على الشكاوى والاقتراحات</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaints List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                    selectedComplaint?.id === complaint.id
                      ? 'ring-2 ring-blue-500'
                      : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        complaint.type === 'شكوى'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {complaint.type}
                      </span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                        complaint.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {complaint.status === 'pending' ? 'قيد الانتظار' : 'تم الرد'}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">{complaint.created_at}</span>
                  </div>

                  <p className="text-gray-800 font-semibold mb-2">{complaint.text}</p>
                  <p className="text-gray-600 text-sm">
                    {complaint.patient_name} • {complaint.phone}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Panel */}
          {selectedComplaint && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Reply className="w-5 h-5" />
                الرد على الشكوى
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">النوع</label>
                  <p className="text-gray-800">{selectedComplaint.type}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الشكوى</label>
                  <p className="text-gray-800">{selectedComplaint.text}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">المرسل</label>
                  <p className="text-gray-800">{selectedComplaint.patient_name}</p>
                  <p className="text-gray-600 text-sm">{selectedComplaint.phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الرد</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="أدخل الرد على الشكوى"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => handleReply(selectedComplaint.id)}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                إرسال الرد
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

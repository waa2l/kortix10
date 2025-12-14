'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Trash2, Edit2 } from 'lucide-react';
import { useClinics } from '@/lib/hooks';

export default function ClinicsSettings() {
  const { clinics, loading } = useClinics();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_number: '',
    control_password: '',
    max_daily_appointments: '50',
  });

  const handleAddClinic = (e: React.FormEvent) => {
    e.preventDefault();
    // Add clinic logic
    setFormData({
      clinic_name: '',
      clinic_number: '',
      control_password: '',
      max_daily_appointments: '50',
    });
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-800">إدارة العيادات</h1>
            <p className="text-gray-600 mt-1">إضافة وتعديل وحذف العيادات</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Add Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة عيادة جديدة
        </button>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleAddClinic} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم العيادة</label>
                  <input
                    type="text"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                    placeholder="أدخل اسم العيادة"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رقم العيادة</label>
                  <input
                    type="number"
                    value={formData.clinic_number}
                    onChange={(e) => setFormData({ ...formData, clinic_number: e.target.value })}
                    placeholder="أدخل رقم العيادة"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={formData.control_password}
                    onChange={(e) => setFormData({ ...formData, control_password: e.target.value })}
                    placeholder="أدخل كلمة المرور"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأقصى للمواعيد</label>
                  <input
                    type="number"
                    value={formData.max_daily_appointments}
                    onChange={(e) => setFormData({ ...formData, max_daily_appointments: e.target.value })}
                    placeholder="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clinics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{clinic.clinic_name}</h3>
                  <p className="text-gray-600 text-sm">رقم {clinic.clinic_number}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>الرقم الحالي: <span className="font-bold text-gray-800">{clinic.current_number}</span></p>
                <p>الحد الأقصى: <span className="font-bold text-gray-800">{clinic.max_daily_appointments}</span></p>
                <p>الحالة: <span className={`font-bold ${clinic.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {clinic.is_active ? 'نشطة' : 'معطلة'}
                </span></p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

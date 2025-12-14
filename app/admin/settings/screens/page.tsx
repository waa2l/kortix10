'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Trash2, Edit2 } from 'lucide-react';

export default function ScreensSettings() {
  const [screens, setScreens] = useState([
    { id: 1, number: 1, password: 'screen123', is_active: true },
    { id: 2, number: 2, password: 'screen456', is_active: true },
    { id: 3, number: 3, password: 'screen789', is_active: true },
    { id: 4, number: 4, password: 'screen012', is_active: true },
    { id: 5, number: 5, password: 'screen345', is_active: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ number: '', password: '' });

  const handleAddScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.number && formData.password) {
      setScreens([
        ...screens,
        {
          id: screens.length + 1,
          number: parseInt(formData.number),
          password: formData.password,
          is_active: true,
        },
      ]);
      setFormData({ number: '', password: '' });
      setShowForm(false);
    }
  };

  const handleDeleteScreen = (id: number) => {
    if (confirm('هل تريد حذف هذه الشاشة؟')) {
      setScreens(screens.filter((s) => s.id !== id));
    }
  };

  const handleToggleActive = (id: number) => {
    setScreens(
      screens.map((s) =>
        s.id === id ? { ...s, is_active: !s.is_active } : s
      )
    );
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
            <h1 className="text-3xl font-bold text-gray-800">إدارة الشاشات</h1>
            <p className="text-gray-600 mt-1">إضافة وتعديل وحذف الشاشات</p>
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
          إضافة شاشة جديدة
        </button>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleAddScreen} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الشاشة</label>
                  <input
                    type="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="أدخل رقم الشاشة"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="أدخل كلمة المرور"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
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

        {/* Screens Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">رقم الشاشة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">كلمة المرور</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((screen) => (
                <tr key={screen.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800 font-semibold">{screen.number}</td>
                  <td className="px-6 py-4 text-gray-600">••••••••</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(screen.id)}
                      className={`px-4 py-2 rounded-full font-bold text-sm ${
                        screen.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {screen.is_active ? 'نشطة' : 'معطلة'}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteScreen(screen.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

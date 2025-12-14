'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { isValidNationalId, generateConsultationCode } from '@/lib/utils';

export default function ConsultationRegister() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    phone: '',
    gender: '',
    family_members: '',
    chronic_diseases: '',
    is_pregnant: false,
    is_breastfeeding: false,
    previous_surgeries: false,
    surgery_details: '',
    drug_allergies: false,
    allergy_details: '',
    current_medications: false,
    medication_details: '',
    mental_health: false,
    mental_health_details: '',
    has_disability: false,
    email: '',
    specialization: '',
    complaint_text: '',
    symptoms: '',
    weight: '',
    height: '',
    blood_pressure: '',
    temperature: '',
    pulse: '',
  });
  const [error, setError] = useState('');
  const [consultationCode, setConsultationCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateStep1 = () => {
    if (!formData.full_name || formData.full_name.length < 3) {
      setError('يجب إدخال الاسم الكامل (3 أحرف على الأقل)');
      return false;
    }
    if (!isValidNationalId(formData.national_id)) {
      setError('الرقم القومي يجب أن يكون 14 رقم');
      return false;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('رقم الهاتف غير صحيح');
      return false;
    }
    if (!formData.gender) {
      setError('يجب اختيار النوع');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email) {
      setError('يجب إدخال البريد الإلكتروني');
      return false;
    }
    if (!formData.specialization) {
      setError('يجب اختيار التخصص');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (!formData.complaint_text || formData.complaint_text.length < 10) {
      setError('يجب إدخال الشكوى (10 أحرف على الأقل)');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleSubmit = () => {
    if (validateStep3()) {
      const code = generateConsultationCode();
      setConsultationCode(code);
      setStep(5);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg rounded-lg mb-8 p-6">
        <div className="flex items-center gap-3 justify-center">
          <ArrowRight className="w-8 h-8" />
          <h1 className="text-3xl font-bold">تسجيل استشارة جديدة</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  s <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">البيانات الشخصية</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم الرباعي</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="أدخل الاسم الكامل"
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01001234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">النوع</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- اختر --</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                  <option value="طفل">طفل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">عدد أفراد الأسرة</label>
                <input
                  type="number"
                  name="family_members"
                  value={formData.family_members}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              التالي
            </button>
          </div>
        )}

        {/* Step 2: Medical History */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">السجل الطبي</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الأمراض المزمنة</label>
              <input
                type="text"
                name="chronic_diseases"
                value={formData.chronic_diseases}
                onChange={handleChange}
                placeholder="سكر، ضغط، إلخ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_pregnant"
                  checked={formData.is_pregnant}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">حمل</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_breastfeeding"
                  checked={formData.is_breastfeeding}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">رضاعة</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="drug_allergies"
                  checked={formData.drug_allergies}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">حساسية من أدوية</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">التخصص المطلوب</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- اختر تخصص --</option>
                <option value="طب الأسرة">طب الأسرة</option>
                <option value="الأطفال">الأطفال</option>
                <option value="النساء والتوليد">النساء والتوليد</option>
                <option value="الأسنان">الأسنان</option>
                <option value="العيون">العيون</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
              >
                السابق
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complaint */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">الشكوى والأعراض</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">نص الشكوى</label>
              <textarea
                name="complaint_text"
                value={formData.complaint_text}
                onChange={handleChange}
                placeholder="أدخل الشكوى بالتفصيل"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الأعراض الحالية</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="أدخل الأعراض"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوزن (كغ)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الطول (سم)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">النبض</label>
                <input
                  type="number"
                  name="pulse"
                  value={formData.pulse}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition-colors"
              >
                السابق
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                إرسال الاستشارة
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">تم إرسال الاستشارة بنجاح!</h2>
            
            <div className="bg-green-50 rounded-lg p-6 mb-6 border-2 border-green-500">
              <p className="text-gray-600 mb-2">رقم الاستشارة:</p>
              <p className="text-4xl font-bold text-green-600">{consultationCode}</p>
            </div>

            <p className="text-gray-700 mb-6">
              احفظ رقم الاستشارة لتتمكن من تتبع حالتك. سيتم الرد عليك قريباً من قبل الطبيب المختص.
            </p>

            <Link href="/consultation/track">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                تتبع الاستشارة
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

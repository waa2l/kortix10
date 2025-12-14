'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight } from 'lucide-react';
import { calculateBMI, getBMICategory, calculateIdealWeight, calculateOvulationDate, calculateDueDate, calculatePregnancyWeek } from '@/lib/utils';

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState('bmi');
  const [bmiData, setBmiData] = useState({ weight: '', height: '' });
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string } | null>(null);
  const [idealWeightData, setIdealWeightData] = useState({ height: '', gender: 'ذكر' as 'ذكر' | 'أنثى' });
  const [idealWeightResult, setIdealWeightResult] = useState<number | null>(null);
  const [ovulationData, setOvulationData] = useState('');
  const [ovulationResult, setOvulationResult] = useState<string | null>(null);
  const [pregnancyData, setPregnancyData] = useState('');
  const [pregnancyResult, setPregnancyResult] = useState<{ dueDate: string; week: number } | null>(null);

  const handleBMICalculate = () => {
    if (bmiData.weight && bmiData.height) {
      const bmi = calculateBMI(parseFloat(bmiData.weight), parseFloat(bmiData.height));
      setBmiResult({
        bmi: Math.round(bmi * 10) / 10,
        category: getBMICategory(bmi),
      });
    }
  };

  const handleIdealWeightCalculate = () => {
    if (idealWeightData.height) {
      const weight = calculateIdealWeight(parseFloat(idealWeightData.height), idealWeightData.gender);
      setIdealWeightResult(Math.round(weight * 10) / 10);
    }
  };

  const handleOvulationCalculate = () => {
    if (ovulationData) {
      const date = calculateOvulationDate(new Date(ovulationData));
      setOvulationResult(date.toLocaleDateString('ar-EG'));
    }
  };

  const handlePregnancyCalculate = () => {
    if (pregnancyData) {
      const dueDate = calculateDueDate(new Date(pregnancyData));
      const week = calculatePregnancyWeek(new Date(pregnancyData));
      setPregnancyResult({
        dueDate: dueDate.toLocaleDateString('ar-EG'),
        week,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <button className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <ArrowRight className="w-5 h-5" />
              العودة
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8" />
            <h1 className="text-3xl font-bold">الحاسبات الطبية</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Calculator Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { id: 'bmi', label: 'حساب BMI' },
            { id: 'ideal-weight', label: 'الوزن المثالي' },
            { id: 'ovulation', label: 'موعد التبويض' },
            { id: 'pregnancy', label: 'موعد الولادة' },
          ].map((calc) => (
            <button
              key={calc.id}
              onClick={() => setActiveCalculator(calc.id)}
              className={`p-4 rounded-lg font-bold transition-colors ${
                activeCalculator === calc.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {calc.label}
            </button>
          ))}
        </div>

        {/* BMI Calculator */}
        {activeCalculator === 'bmi' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">حساب مؤشر كتلة الجسم (BMI)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوزن (كيلوجرام)</label>
                <input
                  type="number"
                  value={bmiData.weight}
                  onChange={(e) => setBmiData({ ...bmiData, weight: e.target.value })}
                  placeholder="أدخل الوزن"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الطول (سنتيمتر)</label>
                <input
                  type="number"
                  value={bmiData.height}
                  onChange={(e) => setBmiData({ ...bmiData, height: e.target.value })}
                  placeholder="أدخل الطول"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleBMICalculate}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              حساب
            </button>
            {bmiResult && (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-500">
                <p className="text-gray-600 mb-2">النتيجة:</p>
                <p className="text-4xl font-bold text-blue-600 mb-2">{bmiResult.bmi}</p>
                <p className="text-lg text-gray-800">{bmiResult.category}</p>
              </div>
            )}
          </div>
        )}

        {/* Ideal Weight Calculator */}
        {activeCalculator === 'ideal-weight' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">حساب الوزن المثالي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الطول (سنتيمتر)</label>
                <input
                  type="number"
                  value={idealWeightData.height}
                  onChange={(e) => setIdealWeightData({ ...idealWeightData, height: e.target.value })}
                  placeholder="أدخل الطول"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">النوع</label>
                <select
                  value={idealWeightData.gender}
                  onChange={(e) => setIdealWeightData({ ...idealWeightData, gender: e.target.value as 'ذكر' | 'أنثى' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleIdealWeightCalculate}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              حساب
            </button>
            {idealWeightResult && (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-500">
                <p className="text-gray-600 mb-2">الوزن المثالي:</p>
                <p className="text-4xl font-bold text-blue-600">{idealWeightResult} كيلوجرام</p>
              </div>
            )}
          </div>
        )}

        {/* Ovulation Calculator */}
        {activeCalculator === 'ovulation' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">حساب موعد التبويض</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ آخر دورة شهرية</label>
              <input
                type="date"
                value={ovulationData}
                onChange={(e) => setOvulationData(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleOvulationCalculate}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              حساب
            </button>
            {ovulationResult && (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-500">
                <p className="text-gray-600 mb-2">موعد التبويض المتوقع:</p>
                <p className="text-2xl font-bold text-blue-600">{ovulationResult}</p>
              </div>
            )}
          </div>
        )}

        {/* Pregnancy Calculator */}
        {activeCalculator === 'pregnancy' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">حساب موعد الولادة المتوقع</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ آخر دورة شهرية</label>
              <input
                type="date"
                value={pregnancyData}
                onChange={(e) => setPregnancyData(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handlePregnancyCalculate}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              حساب
            </button>
            {pregnancyResult && (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-500">
                <p className="text-gray-600 mb-2">موعد الولادة المتوقع:</p>
                <p className="text-2xl font-bold text-blue-600 mb-4">{pregnancyResult.dueDate}</p>
                <p className="text-gray-600 mb-2">عدد الأسابيع:</p>
                <p className="text-2xl font-bold text-blue-600">{pregnancyResult.week} أسبوع</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

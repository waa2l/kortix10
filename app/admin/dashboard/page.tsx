'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
// 1. أضفنا أيقونة FileText هنا
import { 
  Users, Calendar, Settings, Activity, 
  LogOut, UserPlus, FileText, BarChart3,
  Stethoscope, MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    
    // جلب بيانات الأدمن
    const { data: profile } = await supabase
      .from('users')
      .select('email')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setAdminName(profile.email?.split('@')[0] || 'Admin');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600">جاري التحميل...</div>;

  // قائمة المهام
  const menuItems = [
    {
      title: 'إدارة الأطباء',
      href: '/admin/doctors',
      icon: Stethoscope,
      color: 'bg-blue-600',
      desc: 'إضافة وتعديل حسابات الأطباء'
    },
    {
      title: 'إدارة العيادات',
      href: '/admin/clinics',
      icon: Activity,
      color: 'bg-green-600',
      desc: 'التحكم في العيادات والشاشات'
    },
    {
      title: 'إدارة المستخدمين',
      href: '/admin/users',
      icon: Users,
      color: 'bg-purple-600',
      desc: 'إدارة صلاحيات الموظفين'
    },
    // 2. هذا هو الزر الجديد الذي سيأخذك للصفحة التي أنشأتها 👇
    {
      title: 'أرشيف الاستشارات',
      href: '/admin/consultations',
      icon: FileText,
      color: 'bg-teal-600',
      desc: 'مراجعة الاستشارات والروشيتات'
    },
    {
      title: 'التقارير والإحصائيات',
      href: '/admin/reports', // تأكد من وجود هذه الصفحة أو قم بإنشائها لاحقاً
      icon: BarChart3,
      color: 'bg-orange-600',
      desc: 'تقارير الأداء اليومية والشهرية'
    },
    {
      title: 'إعدادات النظام',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-slate-600',
      desc: 'إعدادات المركز وشريط الأخبار'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-cairo p-8" dir="rtl">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">لوحة تحكم المدير</h1>
          <p className="text-slate-500">مرحباً بك، {adminName}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition font-bold"
        >
          <LogOut className="w-5 h-5" />
          تسجيل خروج
        </button>
      </header>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={index} href={item.href}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
                <div className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}

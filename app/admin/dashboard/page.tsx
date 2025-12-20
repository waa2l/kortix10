'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Tv, Building2, Phone, Users, AlertCircle, LogOut, Menu, X } from 'lucide-react';
import { useSettings, useClinics } from '@/lib/hooks';

export default function AdminDashboard() {
  const router = useRouter();
  const { settings, loading: settingsLoading } = useSettings();
  const { clinics, loading: clinicsLoading } = useClinics();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if admin is logged in
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  if (!isClient || settingsLoading || clinicsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'الإعدادات العامة',
      icon: Settings,
      href: '/admin/settings/general',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'إدارة الشاشات',
      icon: Tv,
      href: '/admin/settings/screens',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'إدارة العيادات',
      icon: Building2,
      href: '/admin/settings/clinics',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'إعدادات النداء',
      icon: Phone,
      href: '/admin/settings/calls',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'إدارة الأطباء',
      icon: Users,
      href: '/admin/settings/doctors',
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'الشكاوى والاقتراحات',
      icon: AlertCircle,
      href: '/admin/settings/complaints',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold">الإدارة</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.title}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition-colors text-red-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">تسجيل الخروج</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">لوحة تحكم الإدارة</h1>
              <p className="text-gray-600 mt-1">{settings?.center_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">مرحبا بك في نظام الإدارة</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">عدد العيادات</p>
                  <p className="text-3xl font-bold text-gray-800">{clinics.length}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">الشاشات النشطة</p>
                  <p className="text-3xl font-bold text-gray-800">5</p>
                </div>
                <Tv className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">الأطباء</p>
                  <p className="text-3xl font-bold text-gray-800">10</p>
                </div>
                <Users className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">المركز</p>
                  <p className="text-lg font-bold text-gray-800 truncate">{settings?.center_name}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer group">
                    <div className={`bg-gradient-to-r ${item.color} h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

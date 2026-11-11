import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { NavProvider, useNav } from '@/lib/navigation';
import { AppShell } from '@/components/AppShell';
import { PwaLockdownScreen } from '@/components/PwaLockdown';
import { HomeScreen } from '@/screens/HomeScreen';
import { SectionsScreen } from '@/screens/SectionsScreen';
import { LessonsListScreen } from '@/screens/LessonsListScreen';
import { LessonDetailScreen } from '@/screens/LessonDetailScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { AdminDashboardScreen } from '@/screens/admin/AdminDashboardScreen';
import { AdminTraineesScreen } from '@/screens/admin/AdminTraineesScreen';
import { AdminLessonsScreen } from '@/screens/admin/AdminLessonsScreen';
import { AdminSectionsScreen } from '@/screens/admin/AdminSectionsScreen';
import { AdminSliderScreen } from '@/screens/admin/AdminSliderScreen';
import { BlockedScreen } from '@/screens/BlockedScreen';
import { PrivacyPolicyScreen } from '@/screens/PrivacyPolicyScreen';
import { type ScreenName } from '@/lib/navigation';
import { type ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

const adminScreens: ScreenName[] = [
  'admin-dashboard',
  'admin-trainees',
  'admin-lessons',
  'admin-sections',
  'admin-slider',
  'admin-logs',
];

const protectedScreens: ScreenName[] = [
  'sections',
  'lessons',
  'lesson-detail',
  'admin-dashboard',
  'admin-trainees',
  'admin-lessons',
  'admin-sections',
  'admin-slider',
  'admin-logs',
];

function ScreenRouter() {
  const { current, navigate } = useNav();
  const { profile, loading, blocked } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (blocked) {
    return <BlockedScreen />;
  }

  if (protectedScreens.includes(current.name) && !profile) {
    return <LoginScreen />;
  }

  if (adminScreens.includes(current.name) && (!profile || profile.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <ShieldAlert className="w-12 h-12 text-ink-300 mb-3" />
        <p className="text-ink-500 text-sm">غير مصرح بالوصول</p>
      </div>
    );
  }

  const screens: Record<ScreenName, ReactNode> = {
    'home': <HomeScreen />,
    'sections': <SectionsScreen />,
    'lessons': <LessonsListScreen />,
    'lesson-detail': <LessonDetailScreen />,
    'login': <LoginScreen />,
    'privacy-policy': <PrivacyPolicyScreen />,
    'admin-dashboard': <AdminDashboardScreen />,
    'admin-trainees': <AdminTraineesScreen />,
    'admin-lessons': <AdminLessonsScreen />,
    'admin-sections': <AdminSectionsScreen />,
    'admin-slider': <AdminSliderScreen />,
    'admin-logs': <AdminSliderScreen />,
  };

  return <>{screens[current.name]}</>;
}

export default function App() {
  useEffect(() => {
    const removeBoltBadge = () => {
      const selectors = [
        'a[href*="bolt.new"]',
        'div:has(> a[href*="bolt.new"])',
        'iframe[src*="bolt.new"]',
        '#bolt-',
        '.bolt-badge',
        '.bolt-watermark'
      ];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    };

    removeBoltBadge();
    const interval = setInterval(removeBoltBadge, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <NavProvider>
        <AppShell>
          <ScreenRouter />
        </AppShell>
      </NavProvider>
    </AuthProvider>
  );
}

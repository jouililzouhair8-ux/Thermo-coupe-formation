import { useEffect, useState } from 'react';
import { X, Home, Shield, Settings, LogOut, FileText, FolderOpen } from 'lucide-react';
import { useNav, type ScreenName } from '@/lib/navigation';
import { useAuth } from '@/lib/auth';
import { APP_TITLE } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { SafeImage } from '@/components/SafeImage';
import type { ReactNode } from 'react';
import type { Section } from '@/lib/types';

const LOGO_URL = 'https://i.ibb.co/JRqmCZx6/1790514205185.jpg';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: ReactNode;
  label: string;
  screen: ScreenName;
  params?: Record<string, string>;
  adminOnly?: boolean;
}

export function SideMenu({ open, onClose }: SideMenuProps) {
  const { navigate, goHome, current } = useNav();
  const { profile, signOut } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (open) loadSections();
  }, [open]);

  const loadSections = async () => {
    const { data } = await supabase.from('sections').select('*').order('display_order');
    if (data) setSections(data as Section[]);
  };

  if (!open) return null;

  const menuItems: MenuItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'الرئيسية', screen: 'home' },
    ...sections.map((s) => ({
      icon: <FolderOpen className="w-5 h-5" />,
      label: s.title,
      screen: 'lessons' as ScreenName,
      params: { sectionId: s.id },
    })),
    { icon: <Shield className="w-5 h-5" />, label: 'لوحة التحكم', screen: 'admin-dashboard', adminOnly: true },
    { icon: <Settings className="w-5 h-5" />, label: 'لوحة المشرف', screen: 'admin-slider', adminOnly: true },
    { icon: <FileText className="w-5 h-5" />, label: 'سياسة الخصوصية', screen: 'privacy-policy' },
  ];

  const visibleItems = menuItems.filter((item) => !item.adminOnly || profile?.role === 'admin');

  const handleNavigate = (item: MenuItem) => {
    const protectedScreens: ScreenName[] = ['sections', 'lessons', 'lesson-detail', 'admin-dashboard', 'admin-slider'];
    if (protectedScreens.includes(item.screen) && !profile) {
      navigate('login');
      onClose();
      return;
    }
    navigate(item.screen, item.params);
    onClose();
  };

  const isActive = (item: MenuItem): boolean => {
    if (item.screen === 'home') return current.name === 'home';
    if (item.screen === 'lessons' && item.params?.sectionId) {
      return current.name === 'lessons' && current.params?.sectionId === item.params.sectionId;
    }
    if (item.screen === 'sections') return current.name === 'sections' || current.name === 'lessons' || current.name === 'lesson-detail';
    if (item.screen === 'admin-dashboard') return current.name === 'admin-dashboard';
    if (item.screen === 'admin-slider') return current.name === 'admin-slider' || current.name === 'admin-logo';
    if (item.screen === 'privacy-policy') return current.name === 'privacy-policy';
    return current.name === item.screen;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed top-0 bottom-0 right-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-ink-200">
          <div className="flex items-center gap-2">
            <SafeImage
              src={LOGO_URL}
              alt="logo"
              className="w-8 h-8 rounded-lg object-cover"
              fallbackClassName="w-8 h-8"
              fallbackIconSize={18}
              rounded="rounded-lg"
            />
            <span className="font-display font-extrabold italic text-ink-900 text-sm">
              {APP_TITLE}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ink-100 active:scale-90 transition-all"
          >
            <X className="w-5 h-5 text-ink-900" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {visibleItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigate(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-ink-100 ${
                isActive(item) ? 'bg-ink-100 font-semibold' : 'font-medium'
              } text-ink-900`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-ink-200 p-4">
          {profile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <div className="w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center text-xs font-bold">
                  {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink-900 font-semibold text-sm truncate">
                    {profile.full_name || profile.email}
                  </p>
                  <p className="text-xs text-ink-500">
                    {profile.role === 'admin' ? 'مشرف' : 'متدرب'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  goHome();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-900 rounded-xl hover:bg-ink-100 active:scale-95 transition-all"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('login');
                onClose();
              }}
              className="w-full btn-primary text-sm"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </>
  );
}

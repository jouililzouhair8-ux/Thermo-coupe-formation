import { Users, BookOpen, FolderOpen, Image } from 'lucide-react';
import { useNav } from '@/lib/navigation';
import { useAuth } from '@/lib/auth';
import { SafeImage } from '@/components/SafeImage';
import type { ScreenName } from '@/lib/navigation';
import type { ReactNode } from 'react';

const LOGO_URL = 'https://i.ibb.co/JRqmCZx6/1790514205185.jpg';

interface DashboardCard {
  icon: ReactNode;
  label: string;
  description: string;
  screen: ScreenName;
}

export function AdminDashboardScreen() {
  const { navigate } = useNav();
  const { profile } = useAuth();

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="text-center py-12 text-ink-500 text-sm">
        غير مصرح بالوصول إلى لوحة التحكم
      </div>
    );
  }

  const cards: DashboardCard[] = [
    {
      icon: <Users className="w-6 h-6 text-white" />,
      label: 'إدارة المتدربين',
      description: 'إضافة وعرض المتدربين',
      screen: 'admin-trainees',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-white" />,
      label: 'إدارة الدروس',
      description: 'إضافة وتعديل وحذف الدروس',
      screen: 'admin-lessons',
    },
    {
      icon: <FolderOpen className="w-6 h-6 text-white" />,
      label: 'إدارة الأقسام',
      description: 'إضافة وتعديل الأقسام',
      screen: 'admin-sections',
    },
    {
      icon: <Image className="w-6 h-6 text-white" />,
      label: 'إدارة الصور',
      description: 'إدارة صور السلايدر',
      screen: 'admin-slider',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center pb-2">
        <SafeImage
          src={LOGO_URL}
          alt="logo"
          className="w-14 h-14 rounded-2xl object-cover mx-auto mb-2"
          fallbackClassName="w-14 h-14"
          fallbackIconSize={28}
          rounded="rounded-2xl"
        />
        <h2 className="font-bold text-ink-900 text-lg">لوحة التحكم</h2>
        <p className="text-xs text-ink-500 mt-1">إدارة المنصة التكوينية</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => navigate(card.screen)}
            className="card text-right hover:bg-ink-200 active:scale-[0.97] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-ink-900 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              {card.icon}
            </div>
            <h3 className="font-bold text-ink-900 text-sm mb-0.5">{card.label}</h3>
            <p className="text-xs text-ink-500 leading-relaxed">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

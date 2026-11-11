import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function BlockedScreen() {
  const { signOut } = useAuth();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-ink-900 flex items-center justify-center mb-5">
        <ShieldAlert className="w-9 h-9 text-white" />
      </div>
      <h2 className="font-bold text-ink-900 text-lg mb-2">تم تعليق الحساب</h2>
      <p className="text-sm text-ink-500 leading-relaxed max-w-xs">
        تم تعليق حسابك من طرف الإدارة. يرجى التواصل مع المشرف.
      </p>
      <button
        onClick={() => signOut()}
        className="mt-6 btn-secondary text-sm"
      >
        تسجيل الخروج
      </button>
    </div>
  );
}

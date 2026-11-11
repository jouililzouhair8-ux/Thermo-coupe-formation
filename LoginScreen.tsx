import { useState } from 'react';
import { Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNav } from '@/lib/navigation';
import { APP_TITLE } from '@/lib/constants';
import { SafeImage } from '@/components/SafeImage';

const LOGO_URL = 'https://i.ibb.co/JRqmCZx6/1790514205185.jpg';

export function LoginScreen() {
  const { signIn } = useAuth();
  const { navigate } = useNav();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    const { error: signInError, blocked: isBlocked, role } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
    } else if (isBlocked) {
      setError('تم تعليق حسابك من طرف الإدارة. يرجى التواصل مع المشرف.');
    } else {
      navigate(role === 'admin' ? 'admin-dashboard' : 'sections');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full animate-fade-in">
      <div className="text-center mb-8">
        <SafeImage
          src={LOGO_URL}
          alt="logo"
          className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4"
          fallbackClassName="w-16 h-16"
          fallbackIconSize={32}
          rounded="rounded-2xl"
        />
        <h2 className="font-display font-extrabold italic text-ink-900 text-xl">
          {APP_TITLE}
        </h2>
        <p className="text-sm text-ink-500 mt-2">تسجيل الدخول إلى المنصة التكوينية</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text">رقم الهاتف أو البريد الإلكتروني</label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="06XXXXXXXX أو example@email.com"
              className="input-field pr-11"
              style={{ direction: 'ltr', textAlign: 'left' }}
              dir="ltr"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>
        </div>

        <div>
          <label className="label-text">كلمة المرور</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pr-11 pl-11"
              style={{ direction: 'ltr', textAlign: 'left' }}
              dir="ltr"
              autoComplete="current-password"
              autoCapitalize="none"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 animate-scale-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'تسجيل الدخول'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-ink-400 mt-6">
        يتم إنشاء حسابات المتدربين من طرف المشرف فقط
      </p>
    </div>
  );
}

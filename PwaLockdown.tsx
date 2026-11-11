import { useEffect, useState, useCallback } from 'react';
import { Download, Smartphone, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function usePwaLockdown() {
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setLocked(!isStandalone());
    setChecked(true);

    const handler = (e: MediaQueryListEvent) => {
      setLocked(!e.matches);
    };
    const mql = window.matchMedia('(display-mode: standalone)');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return { locked, checked };
}

export function PwaLockdownScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      alert('يرجى استخدام قائمة المتصفح "إضافة إلى الشاشة الرئيسية" لتثبيت التطبيق');
      return;
    }
    setInstalling(true);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstalling(false);
  }, [deferredPrompt]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white px-6 py-8 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-ink-900 flex items-center justify-center mb-6 shrink-0">
          <Smartphone className="w-10 h-10 text-white" />
        </div>

        <h1 className="font-bold text-ink-900 text-xl mb-2">
          تطبيق Thermo Coupe Training
        </h1>

        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-ink-400" />
          <span className="text-xs text-ink-400 font-medium">منصة تكوين احترافية</span>
        </div>

        <div className="w-full bg-ink-50 border border-ink-200 rounded-2xl p-5 mb-6">
          <p className="text-sm text-ink-700 leading-relaxed">
            الوصول للمنصة غير متاح عبر المتصفح العادي. يرجى تثبيت التطبيق على هاتفك أولاً للولوج للدروس.
          </p>
        </div>

        <button
          onClick={handleInstall}
          disabled={installing}
          className="w-full flex items-center justify-center gap-2 bg-ink-900 text-white text-sm font-semibold rounded-xl px-6 py-4 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {installing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Download className="w-5 h-5" />
              تحميل وتثبيت التطبيق الآن
            </>
          )}
        </button>

        <p className="text-xs text-ink-400 mt-4 leading-relaxed">
          بعد التثبيت، افتح التطبيق من أيقونة الشاشة الرئيسية للوصول الكامل للمنصة
        </p>
      </div>
    </div>
  );
}

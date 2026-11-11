import { useEffect, useState, useCallback } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) return;
    }

    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  if (!showBanner) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 animate-fade-in"
        onClick={handleDismiss}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="max-w-2xl mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-ink-200 p-5 pb-7">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-ink-900 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 text-sm">تثبيت التطبيق</h3>
                <p className="text-xs text-ink-500 mt-0.5">وصول سريع من شاشتك الرئيسية</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:bg-ink-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-ink-600 leading-relaxed mb-4">
            يرجى تثبيت التطبيق على هاتفك لضمان أفضل تجربة متابعة للدروس والولوج السريع
          </p>

          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 bg-ink-900 text-white text-sm font-semibold rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform"
          >
            <Download className="w-5 h-5" />
            تثبيت التطبيق
          </button>
        </div>
      </div>
    </>
  );
}

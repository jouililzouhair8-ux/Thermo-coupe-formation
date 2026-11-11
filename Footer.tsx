import { useLogo } from '@/lib/useLogo';
import { SafeImage } from '@/components/SafeImage';
import { APP_TITLE } from '@/lib/constants';

export function Footer() {
  const { logoUrl } = useLogo();

  return (
    <footer className="bg-white border-t border-ink-200 py-6 mt-auto">
      <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
        <div className="flex items-center gap-2">
          <SafeImage
            src={logoUrl}
            alt="logo"
            className="w-6 h-6 rounded-md object-cover"
            fallbackClassName="w-6 h-6"
            fallbackIconSize={14}
            rounded="rounded-md"
          />
          <span className="font-display font-bold text-ink-900 text-sm">
            {APP_TITLE}
          </span>
        </div>
        <p className="text-xs text-ink-500">
          © {new Date().getFullYear()} جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}

import { ArrowRight, Home, Menu } from 'lucide-react';
import { useNav } from '@/lib/navigation';
import { APP_TITLE } from '@/lib/constants';
import { SafeImage } from '@/components/SafeImage';
import { useLogo } from '@/lib/useLogo';

interface HeaderProps {
  onMenuClick: () => void;
  showMenu?: boolean;
}

export function Header({ onMenuClick, showMenu = true }: HeaderProps) {
  const { goBack, goHome, canGoBack } = useNav();
  const { logoUrl } = useLogo();

  const logoSize = showMenu ? 28 : 40;
  const fallbackIconSize = showMenu ? 16 : 22;

  const logoEl = (
    <SafeImage
      src={logoUrl}
      alt="logo"
      className="object-cover shrink-0"
      fallbackClassName="flex items-center justify-center bg-ink-900"
      fallbackIconSize={fallbackIconSize}
      rounded="rounded-lg"
      width={logoSize}
      height={logoSize}
    />
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-ink-200">
      <div className="flex items-center justify-between px-3 h-14 max-w-2xl mx-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="p-2 rounded-lg transition-colors hover:bg-ink-100 disabled:opacity-30 disabled:hover:bg-transparent active:scale-90"
            aria-label="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-ink-900" />
          </button>
          <button
            onClick={goHome}
            className="p-2 rounded-lg transition-colors hover:bg-ink-100 active:scale-90"
            aria-label="الرئيسية"
          >
            <Home className="w-5 h-5 text-ink-900" />
          </button>
        </div>

        {showMenu ? (
          <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
            {logoEl}
            <h1 className="font-display font-extrabold italic text-ink-900 text-sm sm:text-base whitespace-nowrap">
              {APP_TITLE}
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            {logoEl}
          </div>
        )}

        {showMenu ? (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg transition-colors hover:bg-ink-100 active:scale-90"
            aria-label="القائمة"
          >
            <Menu className="w-5 h-5 text-ink-900" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </header>
  );
}

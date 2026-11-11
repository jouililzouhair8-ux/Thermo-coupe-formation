import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SideMenu } from './SideMenu';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { useNav } from '@/lib/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { current } = useNav();
  const isHome = current.name === 'home';

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <Header onMenuClick={() => setMenuOpen(true)} showMenu={!isHome} />
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4 overflow-y-auto">
        {children}
      </main>
      <Footer />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <PwaInstallPrompt />
    </div>
  );
}

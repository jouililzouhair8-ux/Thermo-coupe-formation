import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ScreenName =
  | 'home'
  | 'sections'
  | 'lessons'
  | 'lesson-detail'
  | 'login'
  | 'privacy-policy'
  | 'admin-dashboard'
  | 'admin-trainees'
  | 'admin-lessons'
  | 'admin-sections'
  | 'admin-slider'
  | 'admin-logo';

export interface ScreenState {
  name: ScreenName;
  params?: Record<string, string>;
}

interface NavContextValue {
  current: ScreenState;
  history: ScreenState[];
  navigate: (screen: ScreenName, params?: Record<string, string>) => void;
  goBack: () => void;
  goHome: () => void;
  canGoBack: boolean;
}

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ScreenState[]>([{ name: 'home' }]);

  const current = history[history.length - 1];

  const navigate = useCallback((screen: ScreenName, params?: Record<string, string>) => {
    setHistory((prev) => [...prev, { name: screen, params }]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const goHome = useCallback(() => {
    setHistory([{ name: 'home' }]);
  }, []);

  return (
    <NavContext.Provider
      value={{ current, history, navigate, goBack, goHome, canGoBack: history.length > 1 }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}

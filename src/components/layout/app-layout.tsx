
'use client';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Footer } from '@/components/layout/footer';
import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Disable the browser's native scroll restoration so it doesn't fight
  // with our own "scroll to top on navigation" logic below (this is what
  // caused some pages to open at a previous scroll position).
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

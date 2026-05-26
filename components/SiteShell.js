'use client';

import { usePathname } from 'next/navigation';
import { AppWrapper } from '@/lib/AppContext';
import Navbar from '@/components/Navbar';
import MenuDrawer from '@/components/MenuDrawer';
import SearchDrawer from '@/components/SearchDrawer';
import Footer from '@/components/Footer';

// Pages that should render WITHOUT the public site shell (no Navbar / Footer)
const BARE_ROUTES = ['/admin', '/install'];

export default function SiteShell({ children }) {
  const pathname = usePathname();
  const isBare = BARE_ROUTES.some((prefix) => pathname.startsWith(prefix));

  if (isBare) {
    // Admin / Install: full-page, no shell chrome
    return <>{children}</>;
  }

  return (
    <AppWrapper>
      <div className="flex-1 w-full flex flex-col items-center">
        <Navbar />
        <SearchDrawer />
        <MenuDrawer />
        <main className="flex-1 w-full max-w-[1280px] px-4 md:px-8 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </AppWrapper>
  );
}

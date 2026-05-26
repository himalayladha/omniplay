'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppContext';

export default function Navbar() {
  const { setSearchOpen, setMenuOpen, siteConfig } = useApp();

  const defaultLogo = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgTxtsnKMoPYRbbE1HF1J9nsC2U6vXB_xApojB87mLZUy_IqcgGv_w37LMNAjmOewzoJtMeX1w_UQV6evcMzeTUgeA9QDa9EeSq1NAZxsaAqKGT4UOqo1QC20Eiw4pz1OqAXYGpEGsVk3vRP96aPSYguyHRniK1bXzdDPQ4fI7jfbhSBur6LRD3XYk0QKSb/w640-h182/0c96497d-5797-4d92-9bec-194851cc895b%20(1).png';

  const logoUrl = siteConfig.site_logo_light 
    ? (siteConfig.site_logo_light.startsWith('http') || siteConfig.site_logo_light.startsWith('/') 
        ? siteConfig.site_logo_light 
        : `/static/img/logo/${siteConfig.site_logo_light}`)
    : defaultLogo;

  return (
    <header className="w-full glass-panel sticky top-0 z-30 py-3.5 px-4 md:px-8 border-b border-white/5">
      <div className="max-w-[1280px] mx-auto flex justify-between items-center">
        <Link href="/" aria-label={`Logo of ${siteConfig.site_name}`} className="flex items-center group transition-transform duration-300 hover:scale-102">
          <img 
            src={logoUrl} 
            alt={`${siteConfig.site_name} logo`} 
            className="h-9 w-auto object-contain brightness-100 group-hover:brightness-110 transition-all"
            onError={(e) => { e.target.src = defaultLogo; }}
          />
        </Link>
        
        <div className="flex gap-3 items-center">
          {/* Search Button */}
          <button 
            onClick={() => setSearchOpen(true)} 
            aria-label="search"
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-blue-500/50 transition-all duration-300 group focus:outline-none cursor-pointer"
            id="search-toggle-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-slate-400 group-hover:stroke-blue-500 transition-colors" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          
          {/* Autoplay Button */}
          <Link 
            href="/autoplay" 
            aria-label="autoplay"
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-purple-500/50 transition-all duration-300 group focus:outline-none cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-slate-400 group-hover:stroke-purple-400 transition-colors" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </Link>
 
          {/* Menu Drawer Toggle Button */}
          <button 
            onClick={() => setMenuOpen(true)} 
            aria-label="menu"
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-pink-500/50 transition-all duration-300 group focus:outline-none cursor-pointer"
            id="menu-toggle-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-slate-400 group-hover:stroke-pink-500 transition-colors" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

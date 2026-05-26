'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppContext';

export default function Navbar() {
  const { setSearchOpen, setMenuOpen, siteConfig } = useApp();

  const logoUrl = siteConfig.site_logo_light 
    ? `/static/img/logo/${siteConfig.site_logo_light}`
    : '/static/img/logo/logo.png';

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-20 py-2.5 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <Link href="/" aria-label={`Logo of ${siteConfig.site_name}`} className="flex items-center">
          <img 
            src={logoUrl} 
            alt={`${siteConfig.site_name} logo`} 
            className="h-10 w-auto object-contain"
            onError={(e) => { e.target.src = '/static/img/logo/logo.png'; }}
          />
        </Link>
        
        <div className="flex gap-4 items-center">
          {/* Search Button */}
          <button 
            onClick={() => setSearchOpen(true)} 
            aria-label="search"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            id="search-toggle-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 17L21 21" stroke="#8c8c8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z" stroke="#8c8c8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          
          {/* Autoplay Button */}
          <Link 
            href="/autoplay" 
            aria-label="autoplay"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 17.5C20 21 23.9486 18.4151 23 15C21.5753 9.87113 20.8001 7.01556 20.3969 5.50793C20.1597 4.62136 19.3562 4 18.4384 4L5.56155 4C4.64382 4 3.844 4.62481 3.62085 5.515C2.7815 8.86349 2.0326 11.8016 1.14415 15C0.195501 18.4151 4.14415 21 6.64415 17.5" stroke="#8c8c8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 4V6C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6L8 4" stroke="#8c8c8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 16C9.10457 16 10 15.1046 10 14C10 12.8954 9.10457 12 8 12C6.89543 12 6 12.8954 6 14C6 15.1046 6.89543 16 8 16Z" stroke="#8c8c8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 16C17.1046 16 18 15.1046 18 14C18 12.8954 17.1046 12 16 12C14.8954 12 14 12.8954 14 14C14 15.1046 14.8954 16 16 16Z" stroke="#8c8c8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Menu Drawer Toggle Button */}
          <button 
            onClick={() => setMenuOpen(true)} 
            aria-label="menu"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            id="menu-toggle-btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5H21" stroke="#8c8c8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 12H21" stroke="#8c8c8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 19H21" stroke="#8c8c8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

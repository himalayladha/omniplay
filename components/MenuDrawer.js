'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MenuDrawer() {
  const { menuOpen, setMenuOpen, user, siteConfig } = useApp();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setMenuOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (!menuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setMenuOpen(false)}
      />
      
      {/* Sliding Menu Panel */}
      <div className="relative w-80 max-w-full h-full glass-panel-dark shadow-2xl flex flex-col p-6 animate-slide-in-right overflow-y-auto border-l border-white/5">
        <button 
          onClick={() => setMenuOpen(false)}
          aria-label="close menu"
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-slate-700/50 transition-all focus:outline-none cursor-pointer"
        >
          <span className="text-xl font-medium text-slate-400 hover:text-white">&times;</span>
        </button>
 
        <div className="mt-10 flex flex-col gap-1.5">
          <Link 
            href="/new-games" 
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-slate-200 hover:text-white font-bold text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-slate-400 group-hover:stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Newest Games
          </Link>
 
          <Link 
            href="/popular-games" 
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-slate-200 hover:text-white font-bold text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-slate-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 18c0 2.415 1.79 3 4 3 3.759 0 5-2.5 2.5-7.5C11 18 10.5 11 11 9c-1.5 3-3 5.818-3 9Z" />
              <path d="M12 21c5.05 0 8-2.904 8-7.875C20 8.155 12 3 12 3S4 8.154 4 13.125C4 18.095 6.95 21 12 21Z" />
            </svg>
            Popular Games
          </Link>
 
          <Link 
            href="/blogs" 
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-slate-200 hover:text-white font-bold text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-slate-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Blogs
          </Link>
 
          <div className="h-[1px] w-full bg-white/5 my-4" />
 
          {user ? (
            <>
              <div className="px-4 py-2.5 flex items-center gap-3 bg-slate-900/40 rounded-xl border border-white/5 mb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="text-xs text-slate-400 font-semibold truncate max-w-[170px]">
                  {user.email}
                </div>
              </div>
 
              <Link 
                href="/admin" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-slate-200 hover:text-white font-bold text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-slate-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Admin Panel
              </Link>
 
              <button 
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 hover:text-red-300 transition-all font-bold text-sm cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-slate-200 hover:text-white font-bold text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-slate-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

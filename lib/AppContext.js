'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AppContext = createContext();

export function AppWrapper({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [siteConfig, setSiteConfig] = useState({
    site_name: 'OmniPlay',
    site_title: 'OmniPlay - Play Free Online HTML5 Games',
    site_desc: 'Play the best free online HTML5 games directly in your browser.',
    site_color: '#1583f9',
    site_logo_sm: 'logo-sm.png',
    site_logo_light: 'logo.png',
    site_logo_dark: 'logo-white.png',
    site_favicon: 'favicon.png',
    footer_content: '<h3>Free Online Games</h3><p>OmniPlay has the best free online games selection...</p>',
  });

  // Fetch session & auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch site configuration from database if available
  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('zon_config')
          .select('*')
          .single();
        if (data && !error) {
          setSiteConfig(data);
        }
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    }
    fetchConfig();
  }, []);

  return (
    <AppContext.Provider value={{
      searchOpen,
      setSearchOpen,
      menuOpen,
      setMenuOpen,
      user,
      setUser,
      siteConfig
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

// Helper to slugify page names
const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default function Footer() {
  const { siteConfig } = useApp();
  const [pages, setPages] = useState([]);

  useEffect(() => {
    async function fetchPages() {
      try {
        const { data, error } = await supabase
          .from('zon_pages')
          .select('id, title')
          .order('id', { ascending: false });
        if (data && !error) {
          setPages(data);
        }
      } catch (err) {
        console.error('Error fetching pages:', err);
      }
    }
    fetchPages();
  }, []);

  const currentYear = new Date().getFullYear();

  const logoUrl = siteConfig.site_logo_light 
    ? `/static/img/logo/${siteConfig.site_logo_light}`
    : '/static/img/logo/logo.png';

  return (
    <footer className="p-8 mt-24 glass-panel border-t border-white/5 w-full" id="site-footer">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={logoUrl} 
            alt={`${siteConfig.site_name} logo`} 
            className="h-7 w-auto object-contain brightness-100"
            onError={(e) => { e.target.src = '/static/img/logo/logo.png'; }}
          />
          <h3 className="text-sm font-semibold text-slate-400">Let the world play</h3>
        </div>
        
        <div className="flex flex-wrap gap-6 justify-center items-center">
          {pages.map((page) => (
            <Link 
              key={page.id}
              href={`/c/${makeSlug(page.title)}`}
              className="capitalize text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              {page.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto text-center mt-8 text-[11px] text-slate-500 font-medium border-t border-white/5 pt-6">
        Copyright © {currentYear} {siteConfig.site_name}. All rights reserved.
      </div>
    </footer>
  );
}

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

  const logoUrl = siteConfig.site_logo_light 
    ? `/static/img/logo/${siteConfig.site_logo_light}`
    : '/static/img/logo/logo.png';

  const currentYear = new Date().getFullYear();

  return (
    <footer className="p-6 mt-20 bg-white border-t border-gray-100 w-full" id="site-footer">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={logoUrl} 
            alt={`${siteConfig.site_name} logo`} 
            className="h-8 w-auto object-contain"
            onError={(e) => { e.target.src = '/static/img/logo/logo.png'; }}
          />
          <h3 className="text-lg font-bold text-[#002b50]">Let the world play</h3>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {pages.map((page) => (
            <Link 
              key={page.id}
              href={`/c/${makeSlug(page.title)}`}
              className="underline capitalize text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {page.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto text-center mt-6 text-xs text-gray-400">
        Copyright © {currentYear} {siteConfig.site_name}. All rights reserved.
      </div>
    </footer>
  );
}

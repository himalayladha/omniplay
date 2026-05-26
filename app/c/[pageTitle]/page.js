import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { pageTitle } = await params;
  const decodedTitle = decodeURIComponent(pageTitle).replace(/-/g, ' ');

  const { data: page } = await supabase
    .from('zon_pages')
    .select('*')
    .ilike('title', decodedTitle)
    .limit(1)
    .maybeSingle();

  if (!page) {
    return {
      title: 'Page Not Found - OmniPlay',
    };
  }

  return {
    title: `${page.title} - OmniPlay`,
    description: page.desc || `${page.title} page for OmniPlay game portal.`,
  };
}

export default async function CustomPage({ params }) {
  const { pageTitle } = await params;
  const decodedTitle = decodeURIComponent(pageTitle).replace(/-/g, ' ');

  // Query database matching pages title
  const { data: page, error } = await supabase
    .from('zon_pages')
    .select('*')
    .ilike('title', decodedTitle)
    .limit(1)
    .maybeSingle();

  if (error || !page) {
    notFound();
  }

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-white capitalize mb-6 pb-4 border-b border-white/5">
        {page.title}
      </h1>
      
      <div 
        className="html-content text-sm text-slate-300 leading-relaxed space-y-4 font-medium"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}

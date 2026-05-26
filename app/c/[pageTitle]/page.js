import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { pageTitle } = params;
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
  const { pageTitle } = params;
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
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#002b50] capitalize mb-6 pb-4 border-b border-gray-100">
        {page.title}
      </h1>
      
      <div 
        className="html-content text-sm text-gray-600 leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}

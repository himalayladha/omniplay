import Link from 'next/link';
import ClientImage from '@/components/ClientImage';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

// Disable caching so blog updates are fetched fresh
export const revalidate = 0;

export default async function BlogDetailsPage({ params }) {
  // Await params to access dynamic route parameter securely in Next.js 15+
  const { id } = await params;

  if (!id || isNaN(parseInt(id))) {
    notFound();
  }

  // Fetch blog from database
  const { data: blog, error } = await supabase
    .from('zon_blog')
    .select('*')
    .eq('id', parseInt(id, 10))
    .maybeSingle();

  if (error || !blog) {
    notFound();
  }

  const publishDate = blog.blog_date 
    ? new Date(blog.blog_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown Date';

  return (
    <div className="max-w-3xl mx-auto py-5 flex flex-col gap-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link 
          href="/blogs" 
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 w-fit"
        >
          <span>← Back to Blog</span>
        </Link>
      </div>

      {/* Main Glass Panel Article */}
      <article className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        {/* Banner Cover */}
        <div className="w-full aspect-[21/9] relative overflow-hidden bg-slate-950/40 border-b border-white/5">
          <ClientImage
            src={blog.blog_image}
            alt={blog.blog_title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Header & Body */}
        <div className="p-6 md:p-10 flex flex-col gap-6">
          <div className="flex flex-col gap-3 border-b border-white/5 pb-5">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{publishDate}</span>
            <h1 className="text-2xl md:text-4xl font-black text-white capitalize leading-tight">
              {blog.blog_title}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-semibold italic leading-relaxed">
              {blog.blog_desc}
            </p>
          </div>

          {/* HTML Article content */}
          <div 
            className="blog-html-content text-slate-300 text-sm md:text-base leading-relaxed space-y-4 font-normal"
            dangerouslySetInnerHTML={{ __html: blog.blog_content }}
          />
        </div>
      </article>
    </div>
  );
}

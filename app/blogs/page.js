import Link from 'next/link';
import ClientImage from '@/components/ClientImage';
import { supabase } from '@/lib/supabase';

// Disable caching so newly published blogs show instantly
export const revalidate = 0;

export default async function BlogsPage() {
  const { data: blogs = [], error } = await supabase
    .from('zon_blog')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
  }

  return (
    <div className="flex flex-col gap-8 py-5">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1.5 rounded-full bg-blue-500" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white capitalize">OmniPlay Blog & News</h1>
        </div>
        <p className="text-slate-400 text-xs md:text-sm font-medium">
          Stay updated with latest announcements, gaming guides, patches, and features.
        </p>
      </div>

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-white/5 py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-2xl">
            📰
          </div>
          <div>
            <p className="text-white font-bold text-sm">No articles published yet</p>
            <p className="text-slate-500 text-xs mt-1">Check back later for fresh updates and patch notes!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => {
            const publishDate = blog.blog_date 
              ? new Date(blog.blog_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Unknown Date';
            return (
              <Link 
                href={`/blogs/${blog.id}`} 
                key={blog.id}
                className="glass-panel rounded-3xl border border-white/5 overflow-hidden hover:border-blue-500/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Article Image cover */}
                <div className="w-full aspect-video relative overflow-hidden bg-slate-950/40 border-b border-white/5">
                  <ClientImage
                    src={blog.blog_image}
                    alt={blog.blog_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">{publishDate}</span>
                    <h2 className="text-base font-bold text-white leading-snug group-hover:text-blue-300 transition-colors line-clamp-2 capitalize">
                      {blog.blog_title}
                    </h2>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-3">
                      {blog.blog_desc}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mt-2 group-hover:text-blue-300">
                    <span>Read Article</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

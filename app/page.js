import GameCard from '@/components/GameCard';
import CategoryCard from '@/components/CategoryCard';
import { supabase } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';
import Link from 'next/link';

// Turn off caching for dynamic database content updates
export const revalidate = 0;

export default async function Home() {
  // 1. Fetch config/about content
  const { data: config } = await supabase
    .from('zon_config')
    .select('*')
    .single();

  // 2. Fetch games (limit 200 to mirror HomeFeedGames behavior)
  const { data: games = [] } = await supabase
    .from('zon_games')
    .select('*')
    .order('id', { ascending: false })
    .limit(200);

  // 3. Fetch categories
  const { data: categories = [] } = await supabase
    .from('zon_category')
    .select('*');

  // Enriched categories with counts and sample images
  const enrichedCategories = await Promise.all(
    categories.map(async (cat) => {
      // Get game count
      const { count } = await supabase
        .from('zon_games')
        .select('*', { count: 'exact', head: true })
        .eq('game_category', cat.name.toLowerCase());

      // Get sample game thumbnail
      const { data: sampleGame } = await supabase
        .from('zon_games')
        .select('game_image_url')
        .eq('game_category', cat.name.toLowerCase())
        .limit(1);

      return {
        ...cat,
        gameCount: count || 0,
        sampleImage: sampleGame?.[0]?.game_image_url || '/static/img/user_pic.png',
      };
    })
  );

  // Spotlight game is the most recently added game
  const heroGame = games[0] || null;

  return (
    <div className="flex flex-col gap-10">
      
      {/* Hero Spotlight Section */}
      {heroGame && (
        <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-white/5 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative">
          {/* Ambient light glow backdrops */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left z-10">
            <span className="bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-black tracking-widest uppercase py-1 px-3.5 rounded-full w-fit mx-auto md:mx-0">
              🔥 Spotlight Game
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white capitalize leading-tight">
              {heroGame.game_name}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-medium line-clamp-3 leading-relaxed max-w-xl">
              {heroGame.game_description}
            </p>
            <Link 
              href={`/g/${makeSlug(heroGame.game_name)}`}
              className="mt-2 w-fit bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 mx-auto md:mx-0 flex items-center gap-2 group cursor-pointer"
            >
              <span>Play Now</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="w-40 md:w-56 aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 shrink-0">
            <img 
              src={heroGame.game_image_url} 
              alt={heroGame.game_name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
            />
          </div>
        </div>
      )}
      
      {/* Games Grid Container */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="h-5 w-1.5 rounded-full bg-blue-500" />
          <h2 className="text-xl font-bold tracking-tight text-white capitalize">Featured Games</h2>
        </div>
        <div className="m-grid-start home grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Categories Grid Container */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="h-5 w-1.5 rounded-full bg-indigo-500" />
          <h2 className="text-xl font-bold tracking-tight text-white capitalize">Browse Categories</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {enrichedCategories.map((cat) => (
            <CategoryCard 
              key={cat.id} 
              category={cat} 
              gameCount={cat.gameCount} 
              sampleGameImageUrl={cat.sampleImage} 
            />
          ))}
        </div>
      </div>

      {/* About Section Footer Block */}
      {config && config.footer_content && (
        <div className="about-content glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl">
          <span className="uppercase text-[10px] font-black tracking-widest text-blue-400 mb-3.5 block">
            About {config.site_name}
          </span>
          <div 
            className="html-content text-xs md:text-sm leading-relaxed text-slate-400 space-y-4"
            dangerouslySetInnerHTML={{ __html: config.footer_content }}
          />
        </div>
      )}
    </div>
  );
}

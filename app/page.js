import GameCard from '@/components/GameCard';
import CategoryCard from '@/components/CategoryCard';
import { supabase } from '@/lib/supabase';

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

  return (
    <div className="flex flex-col gap-8">
      {/* Navbar Layout spacer is handled in layout.js wrapper */}
      
      {/* Games Grid Container */}
      <div>
        <h2 className="text-xl font-bold mb-4 capitalize text-[#002b50]">Featured Games</h2>
        <div className="m-grid-start home grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Categories Grid Container */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 capitalize text-[#002b50]">Browse Categories</h2>
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
        <div className="about-content bg-white mt-12 p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="uppercase text-xs font-bold text-blue-500 mb-3 block">
            About {config.site_name}
          </span>
          <div 
            className="html-content text-sm leading-relaxed text-gray-600 space-y-4"
            dangerouslySetInnerHTML={{ __html: config.footer_content }}
          />
        </div>
      )}
    </div>
  );
}

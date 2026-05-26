import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GameCard from '@/components/GameCard';
import CategoryCard from '@/components/CategoryCard';

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { categoryName } = await params;
  const decodedCategory = decodeURIComponent(categoryName).replace(/-/g, ' ');

  // Fetch category info to verify it exists
  const { data: category } = await supabase
    .from('zon_category')
    .select('*')
    .ilike('name', decodedCategory)
    .limit(1)
    .maybeSingle();

  if (!category) {
    return {
      title: 'Category Not Found - OmniPlay',
    };
  }

  return {
    title: `${category.name} Games - Play Online on OmniPlay`,
    description: `Play the best free online ${category.name} games on OmniPlay. No downloads or logins required.`,
  };
}

export default async function CategoryPage({ params }) {
  const { categoryName } = await params;
  const decodedCategory = decodeURIComponent(categoryName).replace(/-/g, ' ');

  // 1. Fetch category info
  const { data: category, error } = await supabase
    .from('zon_category')
    .select('*')
    .ilike('name', decodedCategory)
    .limit(1)
    .maybeSingle();

  if (error || !category) {
    notFound();
  }

  // 2. Fetch games belonging to this category
  const { data: games = [] } = await supabase
    .from('zon_games')
    .select('*')
    .eq('game_status', 1)
    .eq('game_category', category.name.toLowerCase())
    .order('id', { ascending: false });

  // 3. Fetch other categories to list at the bottom
  const { data: allCategories = [] } = await supabase
    .from('zon_category')
    .select('*')
    .neq('id', category.id);

  const enrichedCategories = await Promise.all(
    allCategories.map(async (cat) => {
      const { count } = await supabase
        .from('zon_games')
        .select('*', { count: 'exact', head: true })
        .eq('game_status', 1)
        .eq('game_category', cat.name.toLowerCase());

      const { data: sampleGame } = await supabase
        .from('zon_games')
        .select('game_image_url')
        .eq('game_status', 1)
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
      {/* Category Header */}
      <div>
        <h1 className="text-2xl font-black text-white capitalize mb-2">{category.name} Games</h1>
        <p className="text-sm text-slate-400 font-medium">Browse and play the best free {category.name} games.</p>
      </div>

      {/* Category Games Grid */}
      <div>
        {games.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl border border-white/5 shadow-2xl">
            <span className="text-slate-400 text-sm font-semibold">No games available in this category yet.</span>
          </div>
        )}
      </div>

      {/* Category Browse Grid */}
      <div className="mt-8 border-t border-white/5 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Other Categories</h2>
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
    </div>
  );
}

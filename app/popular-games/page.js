import { supabase } from '@/lib/supabase';
import GameCard from '@/components/GameCard';

export const revalidate = 0;

export const metadata = {
  title: "Most Popular Games - Play Free HTML5 Games",
  description: "Browse the most popular and highly played free online HTML5 games on OmniPlay.",
};

export default async function PopularGamesPage() {
  const { data: games = [] } = await supabase
    .from('zon_games')
    .select('*')
    .eq('game_status', 1)
    .order('game_played', { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Most Popular Games</h1>
        <p className="text-sm text-slate-400 font-medium">Play the most liked and played games by our global community.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

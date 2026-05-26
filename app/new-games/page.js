import { supabase } from '@/lib/supabase';
import GameCard from '@/components/GameCard';

export const revalidate = 0;

export const metadata = {
  title: "Newest Games - Play Free HTML5 Games",
  description: "Browse the newest and latest free online HTML5 games added daily on OmniPlay.",
};

export default async function NewGamesPage() {
  const { data: games = [] } = await supabase
    .from('zon_games')
    .select('*')
    .order('id', { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Newest Games</h1>
        <p className="text-sm text-slate-400 font-medium">Play the latest and hottest games added to OmniPlay.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

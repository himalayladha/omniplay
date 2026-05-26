import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';

export const revalidate = 0;

export default async function AutoplayPage() {
  // Get total count of games
  const { count } = await supabase
    .from('zon_games')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) {
    // Select a random offset
    const randomOffset = Math.floor(Math.random() * count);
    
    // Fetch the single game at that random offset
    const { data: game } = await supabase
      .from('zon_games')
      .select('game_name')
      .range(randomOffset, randomOffset)
      .single();

    if (game) {
      redirect(`/g/${makeSlug(game.game_name)}`);
    }
  }

  // Fallback to home if no games found
  redirect('/');
}

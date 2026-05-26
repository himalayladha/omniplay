import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GamePlay from '@/components/GamePlay';
import { headers } from 'next/headers';

export const revalidate = 0;

// Dynamic metadata generation for game SEO optimization
export async function generateMetadata({ params }) {
  const { gameName } = await params;
  const decodedName = decodeURIComponent(gameName).replace(/-/g, ' ');

  const { data: game } = await supabase
    .from('zon_games')
    .select('*')
    .ilike('game_name', decodedName)
    .limit(1)
    .single();

  if (!game) {
    return {
      title: 'Game Not Found - OmniPlay',
    };
  }

  return {
    title: `${game.game_name} - Play Free Online on OmniPlay`,
    description: game.game_description ? game.game_description.slice(0, 160) : `Play ${game.game_name} for free online. OmniPlay has the best HTML5 games selection.`,
    openGraph: {
      title: game.game_name,
      description: game.game_description,
      images: [game.game_image_url],
    },
  };
}

export default async function GamePage({ params }) {
  const { gameName } = await params;
  const decodedName = decodeURIComponent(gameName).replace(/-/g, ' ');

  // 1. Fetch game data from database
  const { data: game, error } = await supabase
    .from('zon_games')
    .select('*')
    .ilike('game_name', decodedName)
    .limit(1)
    .maybeSingle();

  if (error || !game) {
    notFound();
  }

  // 2. Fetch related games in the same category
  const { data: relatedGames = [] } = await supabase
    .from('zon_games')
    .select('*')
    .eq('game_category', game.game_category)
    .neq('id', game.id)
    .limit(12);

  // 3. Get likes & dislikes count
  const { count: likesCount } = await supabase
    .from('zon_likes')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', game.id);

  const { count: dislikesCount } = await supabase
    .from('zon_unlikes')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', game.id);

  // 4. Check if current client IP has already liked/disliked
  const headersList = await headers();
  const forwardHeader = headersList.get('x-forwarded-for');
  const userIp = forwardHeader ? forwardHeader.split(',')[0].trim() : '127.0.0.1';

  const { count: hasLikedCount } = await supabase
    .from('zon_likes')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', game.id)
    .eq('user_ip', userIp);

  const { count: hasDislikedCount } = await supabase
    .from('zon_unlikes')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', game.id)
    .eq('user_ip', userIp);

  return (
    <GamePlay 
      game={game} 
      relatedGames={relatedGames} 
      initialLikes={likesCount || 0}
      initialDislikes={dislikesCount || 0}
      hasLiked={hasLikedCount > 0}
      hasDisliked={hasDislikedCount > 0}
    />
  );
}

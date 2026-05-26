import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const { gameId, action } = await request.json();

    if (!gameId || !['like', 'dislike'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    // Get client IP address
    const headersList = await headers();
    const forwardHeader = headersList.get('x-forwarded-for');
    const userIp = forwardHeader ? forwardHeader.split(',')[0].trim() : '127.0.0.1';

    if (action === 'like') {
      // Check if user has liked
      const { data: existingLike } = await supabase
        .from('zon_likes')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_ip', userIp)
        .maybeSingle();

      if (existingLike) {
        // Toggle off: Delete like
        await supabase
          .from('zon_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Toggle on: Insert like and ensure dislike is removed
        await supabase
          .from('zon_likes')
          .insert({ game_id: gameId, user_ip: userIp });

        await supabase
          .from('zon_unlikes')
          .delete()
          .eq('game_id', gameId)
          .eq('user_ip', userIp);
      }
    } else if (action === 'dislike') {
      // Check if user has disliked
      const { data: existingDislike } = await supabase
        .from('zon_unlikes')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_ip', userIp)
        .maybeSingle();

      if (existingDislike) {
        // Toggle off: Delete dislike
        await supabase
          .from('zon_unlikes')
          .delete()
          .eq('id', existingDislike.id);
      } else {
        // Toggle on: Insert dislike and ensure like is removed
        await supabase
          .from('zon_unlikes')
          .insert({ game_id: gameId, user_ip: userIp });

        await supabase
          .from('zon_likes')
          .delete()
          .eq('game_id', gameId)
          .eq('user_ip', userIp);
      }
    }

    // Fetch the updated counts
    const { count: likesCount } = await supabase
      .from('zon_likes')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    const { count: dislikesCount } = await supabase
      .from('zon_unlikes')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    return NextResponse.json({
      success: true,
      likes: likesCount || 0,
      dislikes: dislikesCount || 0
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

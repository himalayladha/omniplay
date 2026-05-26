import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    // Fetch current played count
    const { data: game, error: fetchError } = await supabase
      .from('zon_games')
      .select('game_played')
      .eq('id', gameId)
      .single();

    if (fetchError || !game) {
      throw new Error(fetchError?.message || 'Game not found');
    }

    // Increment count
    const { error: updateError } = await supabase
      .from('zon_games')
      .update({ game_played: (game.game_played || 0) + 1 })
      .eq('id', gameId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

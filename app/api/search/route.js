import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ success: true, games: [] });
  }

  try {
    const { data: games, error } = await supabase
      .from('zon_games')
      .select('*')
      .eq('game_status', 1)
      .ilike('game_name', `%${q}%`)
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ success: true, games });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

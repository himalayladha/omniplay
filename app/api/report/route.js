import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { gameId, gameName, problem } = await request.json();

    if (!gameId || !gameName || !problem) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    // Insert issue record inside public zon_report table
    const { error } = await supabase
      .from('zon_report')
      .insert({
        game_id: gameId,
        game_name: gameName,
        report_subject: problem.trim()
      });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * POST /api/admin/fetch-games
 * Body: { platform, category, type, popularity, amount, page }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { platform, category = 'All', type = 'html5', popularity = 'newest', amount = 20, page = 1 } = body;

    if (!platform) {
      return NextResponse.json({ error: 'Missing required field: platform.' }, { status: 400 });
    }

    // Verify session
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — no session token.' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized — invalid session.' }, { status: 401 });
    }

    // Admin check
    const { data: requestingAdmin, error: adminCheckError } = await supabaseAdmin
      .from('zon_users')
      .select('is_admin')
      .eq('email', user.email)
      .maybeSingle();

    if (adminCheckError || !requestingAdmin || requestingAdmin.is_admin !== 1) {
      return NextResponse.json({ error: 'Forbidden — only admins can fetch games.' }, { status: 403 });
    }

    if (platform !== 'gamemonetize') {
      return NextResponse.json({ error: 'Unsupported platform.' }, { status: 400 });
    }

    const company = '&company=All';
    const fetchUrl = `https://gamemonetize.com/rssfeed.php?format=json&category=${category}&type=${type}&popularity=${popularity}${company}&amount=${amount}`;
    
    const res = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) throw new Error(`GameMonetize API returned status ${res.status}`);
    const rawGames = await res.json();

    if (!Array.isArray(rawGames) || rawGames.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No games found in the feed.' });
    }

    // Map feeds to our schema
    const mappedGames = rawGames.map(g => {
      return {
        game_name: (g.title || '').trim(),
        game_description: (g.description || '').trim(),
        game_image_url: (g.thumb || '').trim(),
        game_url: (g.url || '').trim(),
        game_category: (g.category || 'Uncategorized').trim().toLowerCase(),
        game_published: new Date().toISOString(),
        game_status: 1, // Default to Active
        game_played: 0,
        game_banner_url: '',
        is_featured: 0,
        game_card_size: 'normal'
      };
    }).filter(g => g.game_name && g.game_url);

    if (mappedGames.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No valid games found in the feed.' });
    }

    // Deduplicate against database
    // Fetch all existing names (or subset if there are too many, but limit select for performance)
    const { data: existingGames, error: fetchGamesError } = await supabaseAdmin
      .from('zon_games')
      .select('game_name')
      .limit(1000); // Check recent games
    
    if (fetchGamesError) throw fetchGamesError;

    const existingNames = new Set((existingGames || []).map(g => g.game_name.toLowerCase()));
    const gamesToInsert = mappedGames.filter(g => !existingNames.has(g.game_name.toLowerCase()));

    if (gamesToInsert.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'All games in the feed are already in the database.' });
    }

    // Insert new games
    const { error: insertGamesError } = await supabaseAdmin
      .from('zon_games')
      .insert(gamesToInsert);

    if (insertGamesError) throw insertGamesError;

    // Automatically check and insert new categories
    const categoriesToInsert = [...new Set(gamesToInsert.map(g => g.game_category))].filter(Boolean);
    const { data: existingCategories } = await supabaseAdmin.from('zon_category').select('name');
    const existingCatNames = new Set((existingCategories || []).map(c => c.name.toLowerCase()));

    const newCategories = categoriesToInsert
      .filter(c => !existingCatNames.has(c.toLowerCase()))
      .map(c => ({
        name: c.charAt(0).toUpperCase() + c.slice(1),
        slug: c.trim().toLowerCase().replace(/\s+/g, '-')
      }));

    if (newCategories.length > 0) {
      await supabaseAdmin.from('zon_category').insert(newCategories);
    }

    return NextResponse.json({
      success: true,
      count: gamesToInsert.length,
      message: `Successfully imported ${gamesToInsert.length} new game(s) from ${platform === 'gamemonetize' ? 'GameMonetize' : 'GamePix'}.`
    });

  } catch (err) {
    console.error('Fetch games error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client using service role key if available
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { gameId } = await request.json();
    if (!gameId) {
      return NextResponse.json({ success: false, error: 'Missing gameId' }, { status: 400 });
    }

    // 1. Fetch game details from DB
    const { data: game, error: fetchError } = await supabaseAdmin
      .from('zon_games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();

    if (fetchError || !game) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
    }

    // If game is already offline, return inactive
    if (game.game_status !== 1) {
      return NextResponse.json({ success: true, active: false, reason: 'offline' });
    }

    const gameUrl = game.game_url;
    if (!gameUrl || !gameUrl.startsWith('http')) {
      return NextResponse.json({ success: true, active: true });
    }

    // 2. Perform server-side check with referrer header
    const referer = request.headers.get('origin') || request.headers.get('referer') || 'https://omniplay.vercel.app';
    
    let response;
    let isBlocked = false;
    let blockReason = '';

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000); // 6s timeout

      response = await fetch(gameUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': referer,
          'Origin': referer
        },
        signal: controller.signal
      });
      clearTimeout(id);
    } catch (err) {
      console.error(`Check-embed network error for ${gameUrl}:`, err);
      // If we cannot connect to the game URL, it is down or blocked
      isBlocked = true;
      blockReason = 'Network connection failed / Timeout';
    }

    if (response && !isBlocked) {
      const status = response.status;
      const headers = response.headers;

      // Check HTTP Status
      if (status >= 400) {
        isBlocked = true;
        blockReason = `HTTP Error Status: ${status}`;
      } else {
        // Check X-Frame-Options Header
        const xfo = headers.get('x-frame-options');
        if (xfo) {
          const val = xfo.toLowerCase();
          if (val.includes('deny') || val.includes('sameorigin')) {
            isBlocked = true;
            blockReason = `X-Frame-Options header blocked embedding: ${xfo}`;
          }
        }

        // Check Content-Security-Policy Header
        const csp = headers.get('content-security-policy');
        if (csp) {
          const val = csp.toLowerCase();
          if (val.includes('frame-ancestors') && !val.includes(new URL(referer).hostname)) {
            isBlocked = true;
            blockReason = `CSP frame-ancestors directive blocks this domain: ${csp}`;
          }
        }

        // Check Body Content for block messages
        if (!isBlocked) {
          try {
            const text = await response.text();
            const lowerText = text.toLowerCase();
            
            const blockKeywords = [
              'content blocked',
              'blocked for this website',
              'is blocked for this website',
              'domain is not allowed',
              'not authorized to embed',
              'invalid referrer',
              'invalid origin',
              'hotlinking is disabled'
            ];

            const matchedKeyword = blockKeywords.find(kw => lowerText.includes(kw));
            if (matchedKeyword) {
              isBlocked = true;
              blockReason = `HTML body contains block keyword: "${matchedKeyword}"`;
            }
          } catch (textErr) {
            console.error('Error reading response body text:', textErr);
          }
        }
      }
    }

    // 3. If blocked, disable game in database and file report
    if (isBlocked) {
      console.log(`[Auto-Detector] Disabling game "${game.game_name}" (#${game.id}) due to: ${blockReason}`);
      
      // Update status to 0 (offline)
      await supabaseAdmin
        .from('zon_games')
        .update({ game_status: 0 })
        .eq('id', game.id);

      // Insert bug report
      await supabaseAdmin
        .from('zon_report')
        .insert({
          game_id: game.id,
          game_name: game.game_name,
          report_subject: `[Auto-Detector] Taken offline automatically. Reason: ${blockReason}`
        });

      return NextResponse.json({ success: true, active: false, reason: blockReason });
    }

    return NextResponse.json({ success: true, active: true });

  } catch (err) {
    console.error('Check-embed internal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

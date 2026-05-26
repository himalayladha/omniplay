import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// All required tables for OmniPlay
const REQUIRED_TABLES = [
  'zon_config',
  'zon_users',
  'zon_category',
  'zon_games',
  'zon_likes',
  'zon_unlikes',
  'zon_comments',
  'zon_report',
  'zon_pages',
  'zon_blog',
  'zon_ads',
  'zon_featured_games',
  'zon_section',
];

/**
 * GET /api/setup
 * Check which tables exist and which are missing.
 */
export async function GET() {
  try {
    const results = {};
    let allExist = true;

    for (const table of REQUIRED_TABLES) {
      const { error } = await supabaseAdmin
        .from(table)
        .select('id')
        .limit(1);

      const exists = !error || !error.message.includes('relation') && !error.message.includes('schema cache');
      results[table] = exists;
      if (!exists) allExist = false;
    }

    return NextResponse.json({
      allTablesExist: allExist,
      tables: results,
      setupSqlUrl: '/setup.sql',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

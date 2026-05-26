const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Querying table names from public schema...');
  // We can query usingrpc if we have a sql helper, or query a system view if allowed, 
  // or simply try querying all tables from poko_postgres.sql one by one to see which ones fail.
  const tables = [
    'zon_ads', 'zon_animation_classes', 'zon_blog', 'zon_category', 
    'zon_comments', 'zon_config', 'zon_featured_games', 'zon_games', 
    'zon_likes', 'zon_pages', 'zon_report', 'zon_section', 
    'zon_unlikes', 'zon_users'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (error) {
      console.log(`❌ Table '${table}' DOES NOT exist or error:`, error.message);
    } else {
      console.log(`✅ Table '${table}' exists!`);
    }
  }
}

run().catch(console.error);

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually
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
  console.log('Querying zon_users for "digitalhimalay"...');
  const { data: q1, error: e1 } = await supabase
    .from('zon_users')
    .select('id, username, email')
    .eq('username', 'digitalhimalay');
  
  console.log('Result for digitalhimalay:', q1, 'Error:', e1);

  console.log('Listing first 5 users in zon_users...');
  const { data: q2, error: e2 } = await supabase
    .from('zon_users')
    .select('id, username, email')
    .limit(5);
  
  console.log('Result for top 5 users:', q2, 'Error:', e2);
}

run().catch(console.error);

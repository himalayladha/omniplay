import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase with service_role key — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * GET /api/install
 * Check if installation is needed (no admin exists).
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('zon_users')
      .select('id')
      .eq('is_admin', 1)
      .limit(1);

    if (error) {
      // Table might not exist yet
      return NextResponse.json({ installed: false, tableExists: false, error: error.message });
    }

    return NextResponse.json({
      installed: data && data.length > 0,
      tableExists: true,
    });
  } catch (err) {
    return NextResponse.json({ installed: false, tableExists: false, error: err.message });
  }
}

/**
 * POST /api/install
 * Create the first super-admin account.
 * Body: { name, username, email, password }
 * Only works if no admin account exists yet.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    // Validate
    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // SECURITY: Check that no admin exists — this endpoint is only for first-time setup
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from('zon_users')
      .select('id')
      .eq('is_admin', 1)
      .limit(1);

    if (checkError) {
      return NextResponse.json({ error: 'Database error: ' + checkError.message }, { status: 500 });
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({ error: 'An admin account already exists. Use the admin panel to create additional users.' }, { status: 403 });
    }

    // Check username uniqueness
    const { data: existingUser } = await supabaseAdmin
      .from('zon_users')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 400 });
    }

    // Check email uniqueness
    const { data: existingEmail } = await supabaseAdmin
      .from('zon_users')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
    }

    // 1. Create Supabase Auth account (using admin API — bypasses email verification)
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 500 });
    }

    // 2. Insert user record with is_admin = 1
    const { error: insertError } = await supabaseAdmin
      .from('zon_users')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password: '',
        user_pic: 'user-pic.png',
        status: 1,
        is_admin: 1,
      });

    if (insertError) {
      // Rollback auth user if DB insert fails
      if (authData?.user?.id) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      }
      return NextResponse.json({ error: 'Failed to save user record: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Super admin "${username}" created successfully.`,
    });
  } catch (err) {
    console.error('Install error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

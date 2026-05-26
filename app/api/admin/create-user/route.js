import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase with service_role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * POST /api/admin/create-user
 * Body: { name, username, email, password, is_admin }
 * Requires the requesting user to be an admin (verified via their JWT session).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, username, email, password, is_admin } = body;

    // Validate request inputs
    if (!name || !username || !email || !password || is_admin === undefined) {
      return NextResponse.json({ error: 'Missing required fields (name, username, email, password, is_admin).' }, { status: 400 });
    }

    const role = parseInt(is_admin, 10);
    if (role !== 0 && role !== 1) {
      return NextResponse.json({ error: 'Role must be 0 (user) or 1 (admin).' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Verify the requesting user's session via Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — no session token.' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Validate the token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized — invalid session.' }, { status: 401 });
    }

    // Check if requesting user is an admin in our zon_users table
    const { data: requestingAdmin, error: adminCheckError } = await supabaseAdmin
      .from('zon_users')
      .select('is_admin')
      .eq('email', user.email)
      .maybeSingle();

    if (adminCheckError || !requestingAdmin || requestingAdmin.is_admin !== 1) {
      return NextResponse.json({ error: 'Forbidden — only admins can create users.' }, { status: 403 });
    }

    // Verify if SUPABASE_SERVICE_ROLE_KEY is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local. Admin user creation requires this key to manage Auth records. Please add it from your Supabase Dashboard.'
      }, { status: 400 });
    }

    // Check if email or username already exists in zon_users
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('zon_users')
      .select('email, username')
      .or(`email.eq.${email.trim().toLowerCase()},username.eq.${username.trim().toLowerCase()}`)
      .limit(1);

    if (checkError) throw checkError;
    if (existingUser && existingUser.length > 0) {
      const match = existingUser[0];
      if (match.email.toLowerCase() === email.trim().toLowerCase()) {
        return NextResponse.json({ error: 'Email address already taken.' }, { status: 400 });
      }
      if (match.username.toLowerCase() === username.trim().toLowerCase()) {
        return NextResponse.json({ error: 'Username already taken.' }, { status: 400 });
      }
    }

    // 1. Create the user in Supabase Auth using admin API (bypasses email confirmation link requirement)
    const { data: newAuthUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
    });

    if (signUpError) {
      throw signUpError;
    }

    // 2. Insert user record in zon_users
    const { error: insertError } = await supabaseAdmin
      .from('zon_users')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password: '',
        user_pic: 'user-pic.png',
        status: 1,
        is_admin: role,
      });

    if (insertError) {
      // Rollback Auth creation if database insert fails
      if (newAuthUser?.user?.id) {
        await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: `User "${username}" created successfully as ${role === 1 ? 'an admin' : 'a regular user'}.`,
    });
  } catch (err) {
    console.error('Admin user creation error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

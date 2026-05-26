import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase with service_role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * POST /api/admin/set-role
 * Body: { targetUserId: number, role: 1 | 0 }
 * Requires the requesting user to be an admin (verified via their JWT session).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { targetEmail, role } = body;

    if (!targetEmail || role === undefined) {
      return NextResponse.json({ error: 'Missing targetEmail or role.' }, { status: 400 });
    }
    if (role !== 0 && role !== 1) {
      return NextResponse.json({ error: 'Role must be 0 (user) or 1 (admin).' }, { status: 400 });
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
      return NextResponse.json({ error: 'Forbidden — only admins can change user roles.' }, { status: 403 });
    }

    // Prevent self-demotion
    if (user.email.toLowerCase() === targetEmail.toLowerCase() && role === 0) {
      return NextResponse.json({ error: 'You cannot remove your own admin privileges.' }, { status: 400 });
    }

    // Apply the role change
    const { error: updateError } = await supabaseAdmin
      .from('zon_users')
      .update({ is_admin: role })
      .eq('email', targetEmail.toLowerCase());

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: role === 1 ? `${targetEmail} is now an admin.` : `${targetEmail} is now a regular user.`,
    });
  } catch (err) {
    console.error('Admin role update error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

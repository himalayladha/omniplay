'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Email or Username
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let email = identifier;

      // If the identifier doesn't look like an email, assume it's a username and fetch the email
      if (!identifier.includes('@')) {
        const { data: userRecord, error: fetchError } = await supabase
          .from('zon_users')
          .select('email')
          .eq('username', identifier.trim().toLowerCase())
          .maybeSingle();

        if (fetchError || !userRecord) {
          throw new Error('No user found with that username');
        }
        email = userRecord.email;
      }

      // Log in with Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (loginError) {
        throw loginError;
      }

      // Redirect home on success
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Incorrect login details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h1 className="text-2xl font-bold text-[#002b50] text-center mb-6">Login to OmniPlay</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Username or Email</label>
          <input 
            type="text" 
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter username or email"
            className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 outline-none p-3 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500 outline-none p-3 rounded-xl text-sm"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-500 font-bold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

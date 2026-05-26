'use client';

import { useState } from 'react';
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
    <div className="max-w-md mx-auto mt-16 glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
      
      <h1 className="text-2xl font-black text-white text-center mb-6 tracking-tight">Login to OmniPlay</h1>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold p-3.5 rounded-xl mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Username or Email</label>
          <input 
            type="text" 
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter username or email"
            className="w-full glass-input p-3 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full glass-input p-3 rounded-xl text-sm"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-500 font-medium">
        Access is by invitation only.{' '}
        <span className="text-slate-600">Contact your administrator.</span>
      </div>
    </div>
  );
}

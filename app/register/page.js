'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Verify username is unique in zon_users
      const { data: existingUser } = await supabase
        .from('zon_users')
        .select('id')
        .eq('username', username.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        throw new Error('Username already exists. Please choose another one.');
      }

      // 2. Register user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (signUpError) {
        throw signUpError;
      }

      // 3. Seed user details inside public zon_users table
      if (data?.user) {
        const { error: insertError } = await supabase
          .from('zon_users')
          .insert({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            username: username.trim().toLowerCase(),
            password: '', // Password handled securely by Supabase auth
            user_pic: 'user-pic.png',
            status: 0,
            is_admin: 0
          });

        if (insertError) {
          console.error('Error inserting user profile:', insertError);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
      
      <h1 className="text-2xl font-black text-white text-center mb-6 tracking-tight">Create an Account</h1>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold p-3.5 rounded-xl mb-4 text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold p-3.5 rounded-xl mb-4 text-center">
          Account created successfully! Redirecting to login...
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Full Name</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full glass-input p-3 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Username</label>
          <input 
            type="text" 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
            placeholder="johndoe"
            className="w-full glass-input p-3 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
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
            placeholder="Min 6 characters"
            className="w-full glass-input p-3 rounded-xl text-sm"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || success}
          className="mt-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-400 font-medium">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 hover:underline">
          Login here
        </Link>
      </div>
    </div>
  );
}

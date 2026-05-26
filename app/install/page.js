'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const STEPS = ['Database', 'Welcome', 'Admin Account', 'Site Setup', 'Finish'];

export default function InstallPage() {
  const router = useRouter();
  const [step, setStep] = useState(-1); // -1 = loading
  const [checking, setChecking] = useState(true);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);

  // Database setup state
  const [missingTables, setMissingTables] = useState([]);
  const [dbCheckLoading, setDbCheckLoading] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Admin account fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Site config fields
  const [siteName, setSiteName] = useState('OmniPlay');
  const [siteTitle, setSiteTitle] = useState('OmniPlay - Play Free HTML5 Games');
  const [siteTagline, setSiteTagline] = useState('Let the world play');
  const [siteDesc, setSiteDesc] = useState('Play the best free online HTML5 games instantly in your browser.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminCreated, setAdminCreated] = useState(false);

  useEffect(() => {
    async function checkInstallation() {
      try {
        // Step 1: Check if tables exist via /api/setup
        const setupRes = await fetch('/api/setup');
        const setupResult = await setupRes.json();

        if (!setupResult.allTablesExist) {
          // Some tables are missing — show database setup step
          const missing = Object.entries(setupResult.tables || {})
            .filter(([, exists]) => !exists)
            .map(([name]) => name);
          setMissingTables(missing);
          setStep(0); // Database setup step
          setChecking(false);
          return;
        }

        // Step 2: Check if an admin already exists
        const installRes = await fetch('/api/install');
        const installResult = await installRes.json();

        if (installResult.installed) {
          setAlreadyInstalled(true);
        } else {
          setStep(1); // Skip DB step, go to Welcome
        }
      } catch (err) {
        console.error('Install check error:', err);
        // If API fails entirely, show DB setup step
        setMissingTables(['Unable to connect — check your Supabase configuration']);
        setStep(0);
      } finally {
        setChecking(false);
      }
    }
    checkInstallation();
  }, []);

  const handleRecheckDatabase = async () => {
    setDbCheckLoading(true);
    setError('');
    try {
      const res = await fetch('/api/setup');
      const result = await res.json();

      if (result.allTablesExist) {
        // All tables exist now — check install status
        const installRes = await fetch('/api/install');
        const installResult = await installRes.json();

        if (installResult.installed) {
          setAlreadyInstalled(true);
        } else {
          setMissingTables([]);
          setStep(1); // Move to Welcome
        }
      } else {
        const missing = Object.entries(result.tables || {})
          .filter(([, exists]) => !exists)
          .map(([name]) => name);
        setMissingTables(missing);
        setError(`${missing.length} table(s) still missing. Please run the setup SQL first.`);
      }
    } catch (err) {
      setError('Failed to check database: ' + err.message);
    } finally {
      setDbCheckLoading(false);
    }
  };

  const handleCopySQL = async () => {
    try {
      const res = await fetch('/setup.sql');
      const sql = await res.text();
      await navigator.clipboard.writeText(sql);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 3000);
    } catch {
      // Fallback: open SQL file in new tab
      window.open('/setup.sql', '_blank');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);

    try {
      // Use server-side API to create admin (uses service_role key, bypasses RLS)
      const res = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim(),
          password: password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create admin account.');
      }

      setAdminCreated(true);
      setStep(3); // Move to site setup
    } catch (err) {
      setError(err.message || 'Failed to create admin account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSiteConfig = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Try to update existing config first
      const { data: existing } = await supabase.from('zon_config').select('id').limit(1);

      if (existing && existing.length > 0) {
        await supabase.from('zon_config').update({
          site_name: siteName,
          site_title: siteTitle,
          profile_tagline: siteTagline,
          site_desc: siteDesc,
        }).eq('id', existing[0].id);
      } else {
        await supabase.from('zon_config').insert({
          site_name: siteName,
          site_title: siteTitle,
          profile_tagline: siteTagline,
          site_desc: siteDesc,
          site_color: '#1583f9',
          site_keywords: 'online games, html5 games, free games',
        });
      }
      setStep(4);
    } catch (err) {
      setError('Failed to save site config: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Checking installation status...</p>
        </div>
      </div>
    );
  }

  if (alreadyInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040a] p-4">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Already Installed</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            OmniPlay is already set up with an admin account. If you need to access the admin panel, please login first.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl text-sm text-center block hover:from-blue-600 hover:to-indigo-700 transition-all">
              Go to Login
            </Link>
            <Link href="/" className="w-full text-slate-400 hover:text-white font-semibold py-3 rounded-xl text-sm text-center block transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine active step index for progress bar (offset by -1 if DB step was skipped)
  const displayStep = step;

  return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">OmniPlay Setup</h1>
          <p className="text-slate-400 text-sm mt-1">Initial installation wizard</p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  i < displayStep ? 'bg-green-500 text-white' :
                  i === displayStep ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' :
                  'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {i < displayStep ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : i + 1}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${i === displayStep ? 'text-blue-400' : 'text-slate-600'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-2 transition-all duration-500 ${i < displayStep ? 'bg-green-500/50' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Panels */}
        <div className="glass-panel rounded-3xl border border-white/5 p-6 md:p-8 shadow-2xl">

          {/* Step 0 - Database Setup */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Database Setup Required</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your Supabase project needs the required tables before OmniPlay can work. Follow the steps below.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold p-3.5 rounded-xl">
                  {error}
                </div>
              )}

              {/* Missing tables list */}
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">
                  ⚠ Missing Tables ({missingTables.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missingTables.map(t => (
                    <span key={t} className="text-[10px] bg-red-500/10 text-red-300 px-2.5 py-1 rounded-lg font-mono font-bold">{t}</span>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-bold text-white">Copy the setup SQL</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Click the button below to copy all CREATE TABLE statements to your clipboard.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-bold text-white">Run it in Supabase SQL Editor</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Supabase Dashboard</a> → SQL Editor → New Query → Paste & Run.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/40 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-sm font-bold text-white">Click "Re-check" below</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Once all tables are created, verify and continue to setup.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopySQL}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {sqlCopied ? '✓ Copied!' : 'Copy Setup SQL'}
                </button>
                <button
                  onClick={handleRecheckDatabase}
                  disabled={dbCheckLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  {dbCheckLoading ? 'Checking...' : 'Re-check Database →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 1 - Welcome */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-black text-white mb-2">Welcome to OmniPlay! 🎮</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  This wizard will help you set up your game portal in just a few steps. You'll create the super-admin account that controls everything.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { icon: '🔐', title: 'Create Super Admin', desc: 'The first and most powerful account — only this admin can grant admin rights to others.' },
                  { icon: '⚙️', title: 'Configure Your Site', desc: 'Set your site name, tagline, and SEO metadata.' },
                  { icon: '🚀', title: 'Launch!', desc: 'Your game portal will be live and ready.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/40 border border-white/5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Let's Get Started</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {/* Step 2 - Admin Account */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Create Super Admin Account</h2>
                <p className="text-xs text-slate-400">This will be the master administrator — only admins can promote others.</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold p-3.5 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="glass-input p-3 rounded-xl text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                    <input type="text" required value={username} onChange={e => setUsername(e.target.value.replace(/\s+/g, ''))} placeholder="admin" className="glass-input p-3 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yoursite.com" className="glass-input p-3 rounded-xl text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars" className="glass-input p-3 rounded-xl text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm</label>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="glass-input p-3 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 flex items-start gap-2.5 mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="mt-0.5 shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <p className="text-[10px] text-amber-400/80 font-semibold leading-relaxed">
                    This account will have full admin rights. Only an existing admin can grant admin access to other users.
                  </p>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
                  {loading ? 'Creating Admin Account...' : 'Create Admin Account →'}
                </button>
              </form>
            </div>
          )}

          {/* Step 3 - Site Config */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Configure Your Site</h2>
                <p className="text-xs text-slate-400">Set your site identity and SEO information. You can change this anytime from Admin Panel.</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold p-3.5 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveSiteConfig} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Name</label>
                    <input type="text" required value={siteName} onChange={e => setSiteName(e.target.value)} className="glass-input p-3 rounded-xl text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagline</label>
                    <input type="text" value={siteTagline} onChange={e => setSiteTagline(e.target.value)} className="glass-input p-3 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Page Title</label>
                  <input type="text" required value={siteTitle} onChange={e => setSiteTitle(e.target.value)} className="glass-input p-3 rounded-xl text-sm" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
                  <textarea value={siteDesc} onChange={e => setSiteDesc(e.target.value)} rows={3} className="glass-input p-3 rounded-xl text-sm resize-none" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
                  {loading ? 'Saving...' : 'Save & Continue →'}
                </button>
              </form>
            </div>
          )}

          {/* Step 4 - Done */}
          {step === 4 && (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">You're All Set! 🎉</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                  OmniPlay is ready to go! Login with your admin account to start managing your game portal.
                </p>
              </div>

              <div className="w-full p-4 rounded-2xl bg-slate-900/40 border border-white/5 text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Your Admin Credentials</p>
                <p className="text-xs text-slate-300 font-semibold">Email: <span className="text-blue-400">{email}</span></p>
                <p className="text-[10px] text-slate-500 mt-1">⚠️ Keep these credentials safe. Do not share them.</p>
              </div>

              <div className="flex flex-col w-full gap-3">
                <Link href="/login" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm text-center block transition-all shadow-lg shadow-blue-500/25">
                  Login to Admin Panel
                </Link>
                <Link href="/" className="text-slate-400 hover:text-white font-semibold py-2 rounded-xl text-sm text-center block transition-colors">
                  Visit Site Home →
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6">
          OmniPlay © {new Date().getFullYear()} — Installation Wizard
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ games: 0, categories: 0, reports: 0 });
  const [reports, setReports] = useState([]);
  const [config, setConfig] = useState({
    site_name: '',
    site_title: '',
    site_desc: '',
    site_keywords: '',
    site_color: '#1583f9',
    profile_tagline: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 1. Check user authentication
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      await Promise.all([fetchStats(), fetchReports(), fetchConfig()]);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  async function fetchStats() {
    try {
      const [{ count: gamesCount }, { count: catCount }, { count: reportCount }] = await Promise.all([
        supabase.from('zon_games').select('*', { count: 'exact', head: true }),
        supabase.from('zon_category').select('*', { count: 'exact', head: true }),
        supabase.from('zon_report').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        games: gamesCount || 0,
        categories: catCount || 0,
        reports: reportCount || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }

  async function fetchReports() {
    try {
      const { data } = await supabase
        .from('zon_report')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching bug reports:', err);
    }
  }

  async function fetchConfig() {
    try {
      const { data } = await supabase.from('zon_config').select('*').single();
      if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase
        .from('zon_config')
        .update({
          site_name: config.site_name,
          site_title: config.site_title,
          site_desc: config.site_desc,
          site_keywords: config.site_keywords,
          site_color: config.site_color,
          profile_tagline: config.profile_tagline,
        })
        .eq('id', config.id || 1);

      if (error) throw error;
      setMessage('✅ Configuration saved successfully!');
      // Apply theme color changes dynamically
      document.documentElement.style.setProperty('--theme-color', config.site_color);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error updating config:', err);
      setMessage('❌ Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const { error } = await supabase.from('zon_report').delete().eq('id', reportId);
      if (!error) {
        setReports(reports.filter((r) => r.id !== reportId));
        setStats((prev) => ({ ...prev, reports: Math.max(0, prev.reports - 1) }));
      }
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002b50]">Admin Console</h1>
          <p className="text-sm text-gray-500 mt-1">Manage site configuration and monitor game operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">Logged in as {user?.email}</span>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-full border border-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase">Total Games</span>
            <h3 className="text-2xl font-black text-[#002b50] mt-0.5">{stats.games}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase">Categories</span>
            <h3 className="text-2xl font-black text-[#002b50] mt-0.5">{stats.categories}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase">Bug Reports</span>
            <h3 className="text-2xl font-black text-red-600 mt-0.5">{stats.reports}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Settings & Bug Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#002b50] mb-4">Site Setup & Branding</h2>
            
            {message && (
              <div className={`p-4 rounded-xl text-sm font-semibold mb-4 ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Site Name</label>
                  <input 
                    type="text" 
                    value={config.site_name} 
                    onChange={(e) => setConfig({ ...config, site_name: e.target.value })}
                    required
                    className="border border-gray-200 outline-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Site Color Theme (HEX)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={config.site_color} 
                      onChange={(e) => setConfig({ ...config, site_color: e.target.value })}
                      className="h-11 w-11 rounded-xl cursor-pointer border border-gray-200 p-0.5"
                    />
                    <input 
                      type="text" 
                      value={config.site_color} 
                      onChange={(e) => setConfig({ ...config, site_color: e.target.value })}
                      required
                      placeholder="#1583f9"
                      className="border border-gray-200 outline-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tagline</label>
                <input 
                  type="text" 
                  value={config.profile_tagline} 
                  onChange={(e) => setConfig({ ...config, profile_tagline: e.target.value })}
                  className="border border-gray-200 outline-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">SEO Page Title</label>
                <input 
                  type="text" 
                  value={config.site_title} 
                  onChange={(e) => setConfig({ ...config, site_title: e.target.value })}
                  required
                  className="border border-gray-200 outline-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">SEO Meta Description</label>
                <textarea 
                  value={config.site_desc} 
                  onChange={(e) => setConfig({ ...config, site_desc: e.target.value })}
                  required
                  className="border border-gray-200 outline-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium h-24 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">SEO Keywords (Comma Separated)</label>
                <input 
                  type="text" 
                  value={config.site_keywords} 
                  onChange={(e) => setConfig({ ...config, site_keywords: e.target.value })}
                  className="border border-gray-200 outline-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="mt-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* Bug Reports & Quick Links */}
        <div className="flex flex-col gap-6">
          {/* Supabase Admin Shortcuts */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#002b50] mb-3">Database Admin</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Since OmniPlay runs on **Supabase**, you can manage your games, categories, comments, and users directly through the Supabase Dashboard Table Editor.
            </p>
            <div className="flex flex-col gap-2.5">
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 text-xs font-bold text-[#002b50]"
              >
                <span>🌐 Go to Supabase Dashboard</span>
                <span className="text-gray-400">→</span>
              </a>
              <div className="text-[11px] text-gray-400 mt-2 font-medium bg-blue-50/50 p-3 rounded-xl border border-blue-50 flex flex-col gap-1.5">
                <span className="font-bold text-[#002b50]">Direct CRUD Actions:</span>
                <span>• **Add/Edit Games**: Go to table `zon_games`</span>
                <span>• **Manage Categories**: Go to table `zon_category`</span>
                <span>• **Moderate Comments**: Go to table `zon_comments`</span>
                <span>• **Update Advertisements**: Go to table `zon_ads`</span>
              </div>
            </div>
          </div>

          {/* Bug Reports Panel */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1">
            <h2 className="text-xl font-bold text-[#002b50] mb-4">Bug Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                🎉 No reported bugs!
              </div>
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1">
                {reports.map((r) => (
                  <div key={r.id} className="p-3 bg-red-50/50 rounded-xl border border-red-50 flex flex-col gap-1.5 relative group">
                    <button 
                      onClick={() => handleDeleteReport(r.id)}
                      className="absolute top-2 right-2 text-xs text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Report"
                    >
                      &times;
                    </button>
                    <div className="flex justify-between items-start pr-4">
                      <span className="text-xs font-extrabold text-red-600 capitalize">{r.game_name}</span>
                      <span className="text-[10px] text-gray-400">ID: {r.game_id}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-normal font-medium bg-white/60 p-2.5 rounded-lg border border-red-50/30">
                      {r.problem}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

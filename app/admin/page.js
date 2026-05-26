'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { makeSlug } from '@/lib/utils';


// ─── Icon Components ────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

// ─── Sidebar Navigation Items ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { id: 'games',     label: 'Manage Games', icon: 'M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
  { id: 'config',    label: 'Site Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
  { id: 'users',     label: 'User Management', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { id: 'reports',   label: 'Bug Reports', icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01' },
  { id: 'database',  label: 'Database', icon: 'M12 2C6.48 2 2 4.24 2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7c0-2.76-4.48-5-10-5zM2 12c0 2.76 4.48 5 10 5s10-2.24 10-5M2 7c0 2.76 4.48 5 10 5s10-2.24 10-5' },
];

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, trend }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400',   glow: 'shadow-blue-500/10' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/10' },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400',  glow: 'shadow-green-500/10' },
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    glow: 'shadow-red-500/10' },
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  glow: 'shadow-amber-500/10' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`glass-panel rounded-2xl p-5 border ${c.border} hover:shadow-lg ${c.glow} transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={c.text}>
            <path d={icon} />
          </svg>
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-black text-white tracking-tight">{children}</h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Form Input ───────────────────────────────────────────────────────────────
function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({ games: 0, categories: 0, reports: 0, users: 0 });

  // Reports
  const [reports, setReports] = useState([]);

  // Config
  const [config, setConfig] = useState({ site_name: '', site_title: '', site_desc: '', site_keywords: '', site_color: '#1583f9', profile_tagline: '', spotlight_game_id: null });
  const [saving, setSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState('');

  // Spotlight game picker
  const [spotlightGame, setSpotlightGame] = useState(null);   // currently saved spotlight game object
  const [spotlightSearch, setSpotlightSearch] = useState('');
  const [spotlightResults, setSpotlightResults] = useState([]);
  const [spotlightSearching, setSpotlightSearching] = useState(false);
  const [spotlightSaving, setSpotlightSaving] = useState(false);
  const [spotlightMsg, setSpotlightMsg] = useState('');

  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleLoading, setRoleLoading] = useState(null);
  const [roleMsg, setRoleMsg] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Create user fields & state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createIsAdmin, setCreateIsAdmin] = useState(0);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Quick Fix Bug / Game state
  const [showFixModal, setShowFixModal] = useState(false);
  const [fixReport, setFixReport] = useState(null);
  const [fixGame, setFixGame] = useState(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [fixSaving, setFixSaving] = useState(false);
  const [fixError, setFixError] = useState('');
  const [fixSuccess, setFixSuccess] = useState('');

  // Game Manager states
  const [gameSearch, setGameSearch] = useState('');
  const [gamePage, setGamePage] = useState(1);
  const [gamesList, setGamesList] = useState([]);
  const [gamesTotal, setGamesTotal] = useState(0);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [editGame, setEditGame] = useState(null); // null if adding new game, otherwise the game object to edit
  
  // Game Form states
  const [gameName, setGameName] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  const [gameImage, setGameImage] = useState('');
  const [gameDesc, setGameDesc] = useState('');
  const [gameCategory, setGameCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [gameCardSize, setGameCardSize] = useState('normal');
  const [gameIsFeatured, setGameIsFeatured] = useState(0);
  const [gameStatus, setGameStatus] = useState(1);
  
  const [gameSaveLoading, setGameSaveLoading] = useState(false);
  const [gameError, setGameError] = useState('');
  const [gameSuccess, setGameSuccess] = useState('');
  
  // Category list state for dropdowns
  const [categoriesList, setCategoriesList] = useState([]);




  useEffect(() => {
    async function checkAuth() {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) { router.push('/login'); return; }

      const { data: profile, error } = await supabase
        .from('zon_users')
        .select('is_admin, name, username')
        .eq('email', s.user.email)
        .maybeSingle();

      if (error || !profile || profile.is_admin !== 1) {
        router.push('/');
        return;
      }
      setSession(s);
      setUser({ ...s.user, ...profile });
      await Promise.all([fetchStats(), fetchReports(), fetchConfig(), fetchCategories()]);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const fetchStats = async () => {
    const [g, c, r, u] = await Promise.all([
      supabase.from('zon_games').select('*', { count: 'exact', head: true }),
      supabase.from('zon_category').select('*', { count: 'exact', head: true }),
      supabase.from('zon_report').select('*', { count: 'exact', head: true }),
      supabase.from('zon_users').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ games: g.count || 0, categories: c.count || 0, reports: r.count || 0, users: u.count || 0 });
  };

  const fetchReports = async () => {
    const { data } = await supabase.from('zon_report').select('*').order('id', { ascending: false }).limit(20);
    setReports(data || []);
  };

  const fetchConfig = async () => {
    const { data } = await supabase.from('zon_config').select('*').single();
    if (data) {
      setConfig(data);
      // If a spotlight game is saved, fetch its details
      if (data.spotlight_game_id) {
        const { data: sg } = await supabase
          .from('zon_games')
          .select('id, game_name, game_image_url, game_description')
          .eq('id', data.spotlight_game_id)
          .maybeSingle();
        if (sg) setSpotlightGame(sg);
      }
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('zon_category').select('*').order('name', { ascending: true });
    setCategoriesList(data || []);
  };

  const fetchGames = useCallback(async (search = '', page = 1) => {
    setGamesLoading(true);
    try {
      const limit = 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let q = supabase
        .from('zon_games')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .range(from, to);

      if (search.trim()) {
        q = q.ilike('game_name', `%${search}%`);
      }

      const { data, count, error } = await q;
      if (error) throw error;

      setGamesList(data || []);
      setGamesTotal(count || 0);
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setGamesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (search = '') => {
    setUsersLoading(true);
    try {
      let q = supabase.from('zon_users').select('id, name, email, username, is_admin, status, user_pic').order('id', { ascending: false }).limit(50);
      if (search.trim()) {
        q = q.or(`username.ilike.%${search}%,email.ilike.%${search}%,name.ilike.%${search}%`);
      }
      const { data } = await q;
      setUsers(data || []);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(userSearch);
  }, [activeTab, userSearch, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'games') fetchGames(gameSearch, gamePage);
  }, [activeTab, gameSearch, gamePage, fetchGames]);


  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setConfigMsg('');
    try {
      const { error } = await supabase.from('zon_config').update({
        site_name: config.site_name, site_title: config.site_title,
        site_desc: config.site_desc, site_keywords: config.site_keywords,
        site_color: config.site_color, profile_tagline: config.profile_tagline,
      }).eq('id', config.id || 1);
      if (error) throw error;
      setConfigMsg('success');
      document.documentElement.style.setProperty('--theme-color', config.site_color);
      setTimeout(() => setConfigMsg(''), 3000);
    } catch (err) {
      setConfigMsg('error');
    } finally {
      setSaving(false);
    }
  };

  // Spotlight: live game search (debounced 300ms)
  useEffect(() => {
    if (!spotlightSearch.trim()) { setSpotlightResults([]); return; }
    setSpotlightSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('zon_games')
        .select('id, game_name, game_image_url')
        .ilike('game_name', `%${spotlightSearch}%`)
        .limit(8);
      setSpotlightResults(data || []);
      setSpotlightSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [spotlightSearch]);

  const handleSaveSpotlight = async (game) => {
    setSpotlightSaving(true);
    setSpotlightMsg('');
    try {
      const { error } = await supabase
        .from('zon_config')
        .update({ spotlight_game_id: game.id })
        .eq('id', config.id || 1);
      if (error) throw error;
      setSpotlightGame(game);
      setConfig(prev => ({ ...prev, spotlight_game_id: game.id }));
      setSpotlightSearch('');
      setSpotlightResults([]);
      setSpotlightMsg('success');
      setTimeout(() => setSpotlightMsg(''), 3000);
    } catch (err) {
      setSpotlightMsg('error');
    } finally {
      setSpotlightSaving(false);
    }
  };

  const handleClearSpotlight = async () => {
    setSpotlightSaving(true);
    try {
      await supabase.from('zon_config').update({ spotlight_game_id: null }).eq('id', config.id || 1);
      setSpotlightGame(null);
      setConfig(prev => ({ ...prev, spotlight_game_id: null }));
      setSpotlightMsg('cleared');
      setTimeout(() => setSpotlightMsg(''), 3000);
    } finally {
      setSpotlightSaving(false);
    }
  };

  const handleDeleteReport = async (id) => {
    await supabase.from('zon_report').delete().eq('id', id);
    setReports(prev => prev.filter(r => r.id !== id));
    setStats(prev => ({ ...prev, reports: Math.max(0, prev.reports - 1) }));
  };

  const handleSetRole = async (targetEmail, newRole) => {
    setRoleLoading(targetEmail);
    setRoleMsg('');
    try {
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ targetEmail, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoleMsg(`✅ ${data.message}`);
      fetchUsers(userSearch);
      setTimeout(() => setRoleMsg(''), 4000);
    } catch (err) {
      setRoleMsg(`❌ ${err.message}`);
    } finally {
      setRoleLoading(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: createName,
          username: createUsername,
          email: createEmail,
          password: createPassword,
          is_admin: createIsAdmin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCreateSuccess(data.message);
      fetchUsers(userSearch);
      
      // Reset form fields
      setCreateName('');
      setCreateUsername('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateIsAdmin(0);
      
      // Close modal on success after delay
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess('');
      }, 2000);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreatePassword(pass);
  };

  const handleOpenFixModal = async (report) => {
    setFixReport(report);
    setFixGame(null);
    setFixLoading(true);
    setFixError('');
    setFixSuccess('');
    setShowFixModal(true);
    try {
      const { data, error } = await supabase
        .from('zon_games')
        .select('*')
        .eq('id', report.game_id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setFixError('Game associated with this report was not found in the database.');
      } else {
        setFixGame(data);
      }
    } catch (err) {
      setFixError('Failed to fetch game details: ' + err.message);
    } finally {
      setFixLoading(false);
    }
  };

  const handleSaveFixGame = async (e) => {
    e.preventDefault();
    if (!fixGame) return;
    setFixSaving(true);
    setFixError('');
    setFixSuccess('');
    try {
      const { error } = await supabase
        .from('zon_games')
        .update({
          game_name: fixGame.game_name,
          game_url: fixGame.game_url,
          game_category: fixGame.game_category,
          game_status: fixGame.game_status,
        })
        .eq('id', fixGame.id);

      if (error) throw error;
      setFixSuccess('Game updated successfully!');
      setTimeout(() => setFixSuccess(''), 3000);
    } catch (err) {
      setFixError('Failed to update game: ' + err.message);
    } finally {
      setFixSaving(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    if (!confirm('Mark this report as resolved and delete it?')) return;
    try {
      await handleDeleteReport(reportId);
      setShowFixModal(false);
    } catch (err) {
      alert('Failed to resolve report: ' + err.message);
    }
  };

  const formatGameUrl = (url, gamepixSid) => {
    if (!url) return '';
    let trimmed = url.trim();
    // Matches: gamepix.com/play/game-slug
    const gamepixRegex = /^(https?:\/\/)?(www\.)?gamepix\.com\/play\/([a-zA-Z0-9_-]+)/i;
    const match = trimmed.match(gamepixRegex);
    if (match && match[3]) {
      const slug = match[3];
      const sid = gamepixSid || '10605';
      return `https://play.gamepix.com/${slug}/embed?sid=${sid}`;
    }
    return trimmed;
  };

  const handleOpenGameModal = (game = null) => {
    setGameError('');
    setGameSuccess('');
    if (game) {
      setEditGame(game);
      setGameName(game.game_name || '');
      setGameUrl(game.game_url || '');
      setGameImage(game.game_image_url || '');
      setGameDesc(game.game_description || '');
      setGameCategory(game.game_category || '');
      const categoryExists = categoriesList.some(cat => cat.name.toLowerCase() === (game.game_category || '').toLowerCase());
      setIsCustomCategory(!categoryExists && game.game_category !== '');
      setGameCardSize(game.game_card_size || 'normal');
      setGameIsFeatured(game.is_featured ?? 0);
      setGameStatus(game.game_status ?? 1);
    } else {
      setEditGame(null);
      setGameName('');
      setGameUrl('');
      setGameImage('');
      setGameDesc('');
      setGameCategory('');
      setIsCustomCategory(false);
      setGameCardSize('normal');
      setGameIsFeatured(0);
      setGameStatus(1);
    }
    setShowGameModal(true);
  };

  const handleCreateOrUpdateGame = async (e) => {
    e.preventDefault();
    setGameSaveLoading(true);
    setGameError('');
    setGameSuccess('');
    try {
      const formattedUrl = formatGameUrl(gameUrl, config.gamepix_sid);
      
      const gameData = {
        game_name: gameName.trim(),
        game_url: formattedUrl,
        game_image_url: gameImage.trim(),
        game_description: gameDesc.trim(),
        game_category: gameCategory.toLowerCase().trim(),
        game_card_size: gameCardSize,
        is_featured: gameIsFeatured,
        game_status: gameStatus,
      };

      if (editGame) {
        // Update game
        const { error } = await supabase
          .from('zon_games')
          .update(gameData)
          .eq('id', editGame.id);

        if (error) throw error;
        setGameSuccess('Game updated successfully!');
      } else {
        // Add new game
        const { error } = await supabase
          .from('zon_games')
          .insert({
            ...gameData,
            game_played: 0,
            game_published: new Date().toISOString()
          });

        if (error) throw error;
        setGameSuccess('Game created successfully!');
      }

      await Promise.all([fetchGames(gameSearch, gamePage), fetchStats()]);

      // Auto close modal after 1.5 seconds on success
      setTimeout(() => {
        setShowGameModal(false);
        setGameSuccess('');
      }, 1500);
    } catch (err) {
      setGameError('Error saving game: ' + err.message);
    } finally {
      setGameSaveLoading(false);
    }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this game? This action cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('zon_games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await Promise.all([fetchGames(gameSearch, gamePage), fetchStats()]);
    } catch (err) {
      alert('Failed to delete game: ' + err.message);
    }
  };




  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-sm">Verifying Admin Access</p>
            <p className="text-slate-500 text-xs mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    !userSearch.trim() ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#02040a] flex">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 flex flex-col glass-panel-dark border-r border-white/5 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">OmniPlay</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-left ${
                activeTab === item.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d={item.icon} />
              </svg>
              {item.label}
              {item.id === 'reports' && stats.reports > 0 && (
                <span className="ml-auto text-[10px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded-full">{stats.reports}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black shrink-0">
              {(user?.name || user?.email || 'A')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || user?.username || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-panel-dark border-b border-white/5 px-5 py-3.5 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 transition-all cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div>
            <h1 className="text-sm font-black text-white">{NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Admin'}</h1>
            <p className="text-[10px] text-slate-500 hidden sm:block">OmniPlay Administration Console</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              View Site
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-7 max-w-6xl mx-auto w-full">

          {/* ─ DASHBOARD TAB ───────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-7">
              {/* Welcome banner */}
              <div className="relative glass-panel rounded-2xl p-5 md:p-7 border border-blue-500/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-20 w-32 h-32 bg-indigo-500/8 rounded-full blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Welcome back</p>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    Hello, {user?.name || user?.username || 'Admin'} 👋
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Here's what's happening on your portal today.</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Games"      value={stats.games}      color="blue"   icon="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                <StatCard label="Categories"       value={stats.categories} color="purple" icon="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                <StatCard label="Registered Users" value={stats.users}      color="green"  icon="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z" />
                <StatCard label="Bug Reports"      value={stats.reports}    color="red"    icon="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
              </div>

              {/* Quick Actions */}
              <div>
                <SectionTitle sub="Common administrative tasks">Quick Actions</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Site Settings',   icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z', tab: 'config', color: 'blue' },
                    { label: 'Manage Users',    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z', tab: 'users', color: 'purple' },
                    { label: 'View Reports',    icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', tab: 'reports', color: 'red' },
                    { label: 'Database',        icon: 'M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5S17.52 2 12 2z', tab: 'database', color: 'amber' },
                  ].map(a => (
                    <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                      className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-blue-500/25 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer text-left group">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d={a.icon}/></svg>
                      </div>
                      <p className="text-xs font-bold text-white">{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Reports preview */}
              {reports.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <SectionTitle sub="Latest 3 bug reports">Recent Reports</SectionTitle>
                    <button onClick={() => setActiveTab('reports')} className="text-xs text-blue-400 hover:text-blue-300 font-bold cursor-pointer">View all →</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {reports.slice(0, 3).map(r => (
                      <div key={r.id} className="glass-panel rounded-xl p-4 border border-red-500/10 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white capitalize">{r.game_name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{r.report_subject}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─ GAMES MANAGEMENT TAB ────────────────────────────────────────── */}
          {activeTab === 'games' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
                <SectionTitle sub={`${gamesTotal} total game${gamesTotal !== 1 ? 's' : ''}`}>Manage Games</SectionTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64 shrink-0">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      type="text"
                      value={gameSearch}
                      onChange={e => { setGameSearch(e.target.value); setGamePage(1); }}
                      placeholder="Search games..."
                      className="glass-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleOpenGameModal(null)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Game
                  </button>
                </div>
              </div>

              {/* Games Table/List */}
              <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/5 bg-slate-900/30">
                  <div className="col-span-6 md:col-span-5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Game</div>
                  <div className="col-span-3 md:col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Category</div>
                  <div className="col-span-3 md:col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</div>
                  <div className="col-span-3 md:col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Actions</div>
                </div>

                {gamesLoading ? (
                  <div className="py-12 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : gamesList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm">No games found.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {gamesList.map(game => (
                      <div key={game.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/2 transition-colors">
                        {/* Game Info */}
                        <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                          <img
                            src={game.game_image_url || '/static/img/user_pic.png'}
                            alt={game.game_name}
                            className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                            onError={e => { e.target.src = '/static/img/user_pic.png'; }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate capitalize">{game.game_name}</p>
                            <p className="text-[10px] text-slate-500 truncate">ID: {game.id}</p>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="col-span-3 md:col-span-3">
                          <span className="text-[10px] font-bold text-slate-400 capitalize bg-slate-800/40 px-2.5 py-1 rounded-md border border-white/5">
                            {game.game_category || 'Uncategorized'}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-3 md:col-span-2">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            game.game_status === 1
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-slate-800/60 text-slate-500 border border-white/5'
                          }`}>
                            {game.game_status === 1 ? 'Active' : 'Draft'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-3 md:col-span-2 flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenGameModal(game)}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {gamesTotal > 20 && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-slate-500">
                    Showing {(gamePage - 1) * 20 + 1} - {Math.min(gamePage * 20, gamesTotal)} of {gamesTotal} games
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGamePage(prev => Math.max(1, prev - 1))}
                      disabled={gamePage === 1}
                      className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-slate-900/40 text-slate-400 hover:text-white text-xs font-bold transition-all disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-white font-bold px-2">{gamePage}</span>
                    <button
                      onClick={() => setGamePage(prev => Math.min(Math.ceil(gamesTotal / 20), prev + 1))}
                      disabled={gamePage >= Math.ceil(gamesTotal / 20)}
                      className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-slate-900/40 text-slate-400 hover:text-white text-xs font-bold transition-all disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Game Modal */}
              {showGameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                  <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col gap-5 my-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-white">{editGame ? 'Edit Game' : 'Add New Game'}</h3>
                        <p className="text-[10px] text-slate-500">{editGame ? 'Update existing game details.' : 'Register a new game on the portal.'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGameModal(false)}
                        className="w-7 h-7 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    {/* Messages */}
                    {gameError && (
                      <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold p-3 rounded-xl">
                        {gameError}
                      </div>
                    )}
                    {gameSuccess && (
                      <div className="bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold p-3 rounded-xl">
                        {gameSuccess}
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleCreateOrUpdateGame} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Game Name">
                          <input
                            type="text"
                            required
                            value={gameName}
                            onChange={e => setGameName(e.target.value)}
                            placeholder="Fruit Ninja"
                            className="glass-input p-3 rounded-xl text-sm"
                          />
                        </FormField>

                        <FormField label="Category">
                          <div className="flex gap-2">
                            {isCustomCategory ? (
                              <input
                                type="text"
                                required
                                value={gameCategory}
                                onChange={e => setGameCategory(e.target.value)}
                                placeholder="e.g. action"
                                className="glass-input p-3 rounded-xl text-sm flex-1"
                              />
                            ) : (
                              <select
                                required
                                value={gameCategory}
                                onChange={e => setGameCategory(e.target.value)}
                                className="glass-input p-3 rounded-xl text-sm bg-[#0a0c14] border border-white/5 text-white capitalize flex-1"
                              >
                                <option value="">Select Category</option>
                                {categoriesList.map(cat => (
                                  <option key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</option>
                                ))}
                              </select>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomCategory(!isCustomCategory);
                                setGameCategory('');
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 rounded-xl text-[10px] transition-colors border border-white/5 cursor-pointer whitespace-nowrap"
                            >
                              {isCustomCategory ? 'Use Existing' : '+ Custom'}
                            </button>
                          </div>
                        </FormField>
                      </div>

                      <FormField label="Game Play URL (Iframe Source)">
                        <input
                          type="text"
                          required
                          value={gameUrl}
                          onChange={e => setGameUrl(e.target.value)}
                          onBlur={e => {
                            const formatted = formatGameUrl(e.target.value, config?.gamepix_sid);
                            setGameUrl(formatted);
                          }}
                          placeholder="https://play.gamepix.com/slug/embed?sid=10605"
                          className="glass-input p-3 rounded-xl text-sm"
                        />
                        <p className="text-[9px] text-slate-500 font-medium">
                          💡 You can paste a GamePix play link (e.g. <span className="text-slate-400">gamepix.com/play/slug</span>) here. It will auto-format to embed format on blur or save.
                        </p>
                      </FormField>

                      <FormField label="Thumbnail Image URL">
                        <input
                          type="text"
                          required
                          value={gameImage}
                          onChange={e => setGameImage(e.target.value)}
                          placeholder="https://..."
                          className="glass-input p-3 rounded-xl text-sm"
                        />
                      </FormField>

                      <FormField label="Description">
                        <textarea
                          value={gameDesc}
                          onChange={e => setGameDesc(e.target.value)}
                          rows={3}
                          placeholder="Brief description of the game rules, controls, or gameplay..."
                          className="glass-input p-3 rounded-xl text-sm resize-none"
                        />
                      </FormField>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Card Grid Size">
                          <select
                            value={gameCardSize}
                            onChange={e => setGameCardSize(e.target.value)}
                            className="glass-input p-3 rounded-xl text-sm bg-[#0a0c14] border border-white/5 text-white"
                          >
                            <option value="normal">Normal (Square)</option>
                            <option value="wide">Wide (Banner)</option>
                            <option value="tall">Tall (Vertical)</option>
                            <option value="large">Large (Big Square)</option>
                          </select>
                        </FormField>

                        <FormField label="Spotlight/Featured Status">
                          <select
                            value={gameIsFeatured}
                            onChange={e => setGameIsFeatured(parseInt(e.target.value, 10))}
                            className="glass-input p-3 rounded-xl text-sm bg-[#0a0c14] border border-white/5 text-white"
                          >
                            <option value={0}>Regular Game</option>
                            <option value={1}>Featured Game</option>
                          </select>
                        </FormField>

                        <FormField label="Publishing Status">
                          <select
                            value={gameStatus}
                            onChange={e => setGameStatus(parseInt(e.target.value, 10))}
                            className="glass-input p-3 rounded-xl text-sm bg-[#0a0c14] border border-white/5 text-white"
                          >
                            <option value={1}>Active / Online</option>
                            <option value={0}>Draft / Offline</option>
                          </select>
                        </FormField>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowGameModal(false)}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-white font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={gameSaveLoading}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {gameSaveLoading ? (
                            <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                          ) : (
                            editGame ? 'Save Changes' : 'Create Game'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─ SITE CONFIG TAB ─────────────────────────────────────────────── */}
          {activeTab === 'config' && (
            <div className="flex flex-col gap-6 max-w-2xl">
              <SectionTitle sub="Update your site branding and SEO metadata">Site Settings & Branding</SectionTitle>

              {configMsg === 'success' && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/25 text-green-400 text-sm font-semibold flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Configuration saved successfully!
                </div>
              )}
              {configMsg === 'error' && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Failed to save. Please try again.
                </div>
              )}

              {/* ── Spotlight Game Picker ─────────────────────────────────── */}
              <div className="glass-panel rounded-2xl border border-blue-500/15 p-5 md:p-6 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">Spotlight Game</p>
                    <p className="text-[11px] text-slate-400">Choose the hero game shown at the top of the homepage</p>
                  </div>
                  {spotlightGame && (
                    <span className="ml-auto text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase tracking-wider">Active</span>
                  )}
                </div>

                {/* Current spotlight preview */}
                {spotlightGame ? (
                  <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/40 border border-white/5">
                    <img
                      src={spotlightGame.game_image_url || '/static/img/user_pic.png'}
                      alt={spotlightGame.game_name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                      onError={e => { e.target.src = '/static/img/user_pic.png'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white capitalize truncate">{spotlightGame.game_name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">ID: {spotlightGame.id}</p>
                    </div>
                    <button
                      onClick={handleClearSpotlight}
                      disabled={spotlightSaving}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {spotlightSaving ? '...' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/30 border border-dashed border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold">No spotlight game set — the latest game will be shown by default.</p>
                  </div>
                )}

                {/* Spotlight status messages */}
                {spotlightMsg === 'success' && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Spotlight game updated! Homepage will now show this game.
                  </div>
                )}
                {spotlightMsg === 'cleared' && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-white/5 text-slate-400 text-xs font-semibold">
                    Spotlight cleared — homepage will auto-select the latest game.
                  </div>
                )}

                {/* Search box */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search & Set Spotlight Game</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      type="text"
                      value={spotlightSearch}
                      onChange={e => setSpotlightSearch(e.target.value)}
                      placeholder="Type a game name to search…"
                      className="glass-input w-full pl-9 pr-10 py-2.5 rounded-xl text-sm"
                    />
                    {spotlightSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Search results dropdown */}
                  {spotlightResults.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1 max-h-56 overflow-y-auto rounded-xl border border-white/5 bg-slate-950/90 backdrop-blur-md p-1.5">
                      {spotlightResults.map(game => (
                        <button
                          key={game.id}
                          onClick={() => handleSaveSpotlight(game)}
                          disabled={spotlightSaving}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all cursor-pointer text-left disabled:opacity-50 group w-full"
                        >
                          <img
                            src={game.game_image_url || '/static/img/user_pic.png'}
                            alt={game.game_name}
                            className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                            onError={e => { e.target.src = '/static/img/user_pic.png'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white capitalize truncate group-hover:text-blue-300 transition-colors">{game.game_name}</p>
                            <p className="text-[10px] text-slate-500">ID: {game.id}</p>
                          </div>
                          <span className="text-[10px] font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pr-1">
                            {spotlightSaving ? '…' : 'Set ⭐'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {spotlightSearch.trim() && !spotlightSearching && spotlightResults.length === 0 && (
                    <p className="text-[11px] text-slate-500 text-center py-2">No games found for &quot;{spotlightSearch}&quot;</p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="glass-panel rounded-2xl border border-white/5 p-5 md:p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Site Name">
                    <input type="text" value={config.site_name} onChange={e => setConfig({ ...config, site_name: e.target.value })} required className="glass-input p-3 rounded-xl text-sm" />
                  </FormField>
                  <FormField label="Site Tagline">
                    <input type="text" value={config.profile_tagline} onChange={e => setConfig({ ...config, profile_tagline: e.target.value })} className="glass-input p-3 rounded-xl text-sm" />
                  </FormField>
                </div>

                <FormField label="SEO Page Title">
                  <input type="text" value={config.site_title} onChange={e => setConfig({ ...config, site_title: e.target.value })} required className="glass-input p-3 rounded-xl text-sm" />
                </FormField>

                <FormField label="SEO Meta Description">
                  <textarea value={config.site_desc} onChange={e => setConfig({ ...config, site_desc: e.target.value })} rows={3} className="glass-input p-3 rounded-xl text-sm resize-none" />
                </FormField>

                <FormField label="SEO Keywords (comma separated)">
                  <input type="text" value={config.site_keywords} onChange={e => setConfig({ ...config, site_keywords: e.target.value })} className="glass-input p-3 rounded-xl text-sm" />
                </FormField>

                <FormField label="Brand Color">
                  <div className="flex gap-3">
                    <input type="color" value={config.site_color} onChange={e => setConfig({ ...config, site_color: e.target.value })} className="h-11 w-14 rounded-xl cursor-pointer bg-transparent border border-white/10 p-0.5" />
                    <input type="text" value={config.site_color} onChange={e => setConfig({ ...config, site_color: e.target.value })} placeholder="#1583f9" className="glass-input p-3 rounded-xl text-sm flex-1" />
                  </div>
                </FormField>

                <button type="submit" disabled={saving} className="mt-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer">
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save Settings</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ─ USER MANAGEMENT TAB ─────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
                <SectionTitle sub="Grant or revoke admin privileges — only admins can do this">User Management</SectionTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64 shrink-0">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      className="glass-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setCreateName('');
                      setCreateUsername('');
                      setCreateEmail('');
                      setCreatePassword('');
                      setCreateIsAdmin(0);
                      setCreateError('');
                      setCreateSuccess('');
                      setShowCreateModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add User
                  </button>
                </div>
              </div>

              {/* Create User Modal */}
              {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                  <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-white">Create User or Admin</h3>
                        <p className="text-[10px] text-slate-500">Account will be initialized and ready to use.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="w-7 h-7 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    {/* Messages */}
                    {createError && (
                      <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold p-3 rounded-xl">
                        {createError}
                      </div>
                    )}
                    {createSuccess && (
                      <div className="bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold p-3 rounded-xl">
                        {createSuccess}
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                      <FormField label="Full Name">
                        <input
                          type="text"
                          required
                          value={createName}
                          onChange={e => setCreateName(e.target.value)}
                          placeholder="Jane Doe"
                          className="glass-input p-3 rounded-xl text-sm"
                        />
                      </FormField>

                      <FormField label="Username">
                        <input
                          type="text"
                          required
                          value={createUsername}
                          onChange={e => setCreateUsername(e.target.value.replace(/\s+/g, ''))}
                          placeholder="janedoe"
                          className="glass-input p-3 rounded-xl text-sm"
                        />
                      </FormField>

                      <FormField label="Email Address">
                        <input
                          type="email"
                          required
                          value={createEmail}
                          onChange={e => setCreateEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="glass-input p-3 rounded-xl text-sm"
                        />
                      </FormField>

                      <FormField label="Password">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={createPassword}
                            onChange={e => setCreatePassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className="glass-input p-3 rounded-xl text-sm flex-1"
                          />
                          <button
                            type="button"
                            onClick={generatePassword}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 rounded-xl text-xs transition-colors border border-white/5 cursor-pointer"
                          >
                            Generate
                          </button>
                        </div>
                      </FormField>

                      <FormField label="Account Role">
                        <select
                          value={createIsAdmin}
                          onChange={e => setCreateIsAdmin(parseInt(e.target.value, 10))}
                          className="glass-input p-3 rounded-xl text-sm bg-[#0a0c14] border border-white/5 text-white"
                        >
                          <option value={0}>Regular User</option>
                          <option value={1}>Administrator</option>
                        </select>
                      </FormField>

                      {/* Actions */}
                      <div className="flex gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={createLoading}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {createLoading ? (
                            <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                          ) : (
                            'Create Account'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {roleMsg && (
                <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 ${roleMsg.startsWith('✅') ? 'bg-green-500/10 border border-green-500/25 text-green-400' : 'bg-red-500/10 border border-red-500/25 text-red-400'}`}>
                  {roleMsg}
                </div>
              )}

              {/* Admin security notice */}
              <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20 flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="mt-0.5 shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <div>
                  <p className="text-xs font-bold text-amber-400 mb-0.5">Admin-Only Action</p>
                  <p className="text-[11px] text-amber-400/70 leading-relaxed">Only existing administrators can promote or demote users. All role changes are verified server-side through a secure API endpoint.</p>
                </div>
              </div>

              {/* Users Table */}
              <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/5 bg-slate-900/30">
                  <div className="col-span-5 text-[10px] font-black text-slate-500 uppercase tracking-wider">User</div>
                  <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-wider hidden md:block">Email</div>
                  <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">Role</div>
                  <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Actions</div>
                </div>

                {usersLoading ? (
                  <div className="py-12 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm">No users found.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <div key={u.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/2 transition-colors">
                        {/* User info */}
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-white/10 flex items-center justify-center text-white text-xs font-black shrink-0">
                            {(u.name || u.username || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{u.name || u.username}</p>
                            <p className="text-[10px] text-slate-500 truncate">@{u.username}</p>
                          </div>
                        </div>
                        {/* Email */}
                        <div className="col-span-3 hidden md:block">
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                        {/* Role badge */}
                        <div className="col-span-2">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            u.is_admin === 1
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                              : 'bg-slate-800/60 text-slate-500 border border-white/5'
                          }`}>
                            {u.is_admin === 1 ? '⭐ Admin' : 'User'}
                          </span>
                        </div>
                        {/* Action button */}
                        <div className="col-span-2 flex justify-end">
                          {u.email === user?.email ? (
                            <span className="text-[10px] text-slate-600 font-semibold">You</span>
                          ) : (
                            <button
                              onClick={() => handleSetRole(u.email, u.is_admin === 1 ? 0 : 1)}
                              disabled={roleLoading === u.email}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 ${
                                u.is_admin === 1
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                              }`}
                            >
                              {roleLoading === u.email ? (
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              ) : u.is_admin === 1 ? 'Demote' : 'Make Admin'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-600 text-center">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} shown</p>
            </div>
          )}

          {/* ─ BUG REPORTS TAB ─────────────────────────────────────────────── */}
          {activeTab === 'reports' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-end justify-between">
                <SectionTitle sub={`${stats.reports} total report${stats.reports !== 1 ? 's' : ''}`}>Bug Reports</SectionTitle>
                {reports.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm('Delete ALL bug reports?')) return;
                      await supabase.from('zon_report').delete().neq('id', 0);
                      setReports([]);
                      setStats(prev => ({ ...prev, reports: 0 }));
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    Clear All
                  </button>
                )}
              </div>

              {reports.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/5 py-16 flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">All clear!</p>
                    <p className="text-xs text-slate-500 mt-1">No bug reports submitted by users.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map(r => (
                    <div key={r.id} className="glass-panel rounded-2xl border border-red-500/10 p-4 flex flex-col gap-3 group relative">
                      <button
                        onClick={() => handleDeleteReport(r.id)}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/0 hover:bg-red-500/15 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete report"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                      </button>
                      <div className="flex items-center gap-2 pr-8">
                        <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                        </div>
                        <p className="text-xs font-black text-white capitalize truncate">{r.game_name}</p>
                        <span className="ml-auto text-[10px] text-slate-600 shrink-0">#{r.game_id}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-white/5">
                        {r.report_subject}
                      </p>
                      <div className="flex items-center gap-3 mt-1 pt-2.5 border-t border-white/5">
                        <Link
                          href={`/g/${makeSlug(r.game_name)}`}
                          target="_blank"
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                          Test Game
                        </Link>
                        <button
                          onClick={() => handleOpenFixModal(r)}
                          className="ml-auto flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Fix Game
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Fix Modal */}
              {showFixModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                  <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-white">Quick Game Fixer</h3>
                        <p className="text-[10px] text-slate-500">Fix URL, category, or status directly.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFixModal(false)}
                        className="w-7 h-7 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    {/* Loading state */}
                    {fixLoading && (
                      <div className="py-12 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-500 font-semibold">Loading game details...</p>
                      </div>
                    )}

                    {/* Messages */}
                    {fixError && (
                      <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold p-3.5 rounded-xl">
                        {fixError}
                      </div>
                    )}
                    {fixSuccess && (
                      <div className="bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold p-3.5 rounded-xl">
                        {fixSuccess}
                      </div>
                    )}

                    {/* Game Editor Form */}
                    {!fixLoading && fixGame && (
                      <form onSubmit={handleSaveFixGame} className="flex flex-col gap-4">
                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col gap-1">
                          <p className="text-[10px] font-black text-red-400 uppercase tracking-wider">User Reported Problem</p>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic">
                            &ldquo;{fixReport?.report_subject}&rdquo;
                          </p>
                        </div>

                        <FormField label="Game Name">
                          <input
                            type="text"
                            required
                            value={fixGame.game_name}
                            onChange={e => setFixGame({ ...fixGame, game_name: e.target.value })}
                            className="glass-input p-3 rounded-xl text-sm"
                          />
                        </FormField>

                        <FormField label="Game Play URL (Iframe Source)">
                          <input
                            type="text"
                            required
                            value={fixGame.game_url || ''}
                            onChange={e => setFixGame({ ...fixGame, game_url: e.target.value })}
                            placeholder="https://..."
                            className="glass-input p-3 rounded-xl text-sm"
                          />
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                          <FormField label="Category">
                            <input
                              type="text"
                              required
                              value={fixGame.game_category || ''}
                              onChange={e => setFixGame({ ...fixGame, game_category: e.target.value })}
                              placeholder="action"
                              className="glass-input p-3 rounded-xl text-sm"
                            />
                          </FormField>

                          <FormField label="Status">
                            <select
                              value={fixGame.game_status ?? 1}
                              onChange={e => setFixGame({ ...fixGame, game_status: parseInt(e.target.value, 10) })}
                              className="glass-input p-3 rounded-xl text-sm bg-[#0a0c14] border border-white/5 text-white"
                            >
                              <option value={1}>Active / Online</option>
                              <option value={0}>Draft / Offline</option>
                            </select>
                          </FormField>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5 mt-2">
                          <Link
                            href={`/g/${makeSlug(fixGame.game_name)}`}
                            target="_blank"
                            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white font-bold py-3.5 rounded-xl text-xs transition-all text-center block"
                          >
                            Test Page 🔗
                          </Link>
                          <button
                            type="submit"
                            disabled={fixSaving}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {fixSaving ? (
                              <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                        </div>

                        <div className="h-px bg-white/5 my-1" />

                        <button
                          type="button"
                          onClick={() => handleResolveReport(fixReport.id)}
                          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Resolve & Delete Report
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─ DATABASE TAB ────────────────────────────────────────────────── */}
          {activeTab === 'database' && (
            <div className="flex flex-col gap-6 max-w-2xl">
              <SectionTitle sub="Direct access to your Supabase database tables">Database Management</SectionTitle>

              <div className="glass-panel rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-xs text-blue-300 leading-relaxed">
                    OmniPlay uses Supabase as its backend. You can manage your data directly through the Supabase Dashboard.
                  </p>
                </div>

                <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:from-emerald-500/15 hover:to-teal-500/15 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5S17.52 2 12 2z"/><path d="M2 12c0 2.76 4.48 5 10 5s10-2.24 10-5M2 17c0 2.76 4.48 5 10 5s10-2.24 10-5"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Supabase Dashboard</p>
                      <p className="text-[11px] text-slate-400">Table editor, SQL editor, and more</p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { table: 'zon_games',    label: 'Games',       desc: 'Add, edit or remove games', color: 'blue' },
                    { table: 'zon_category', label: 'Categories',  desc: 'Manage game categories',    color: 'purple' },
                    { table: 'zon_users',    label: 'Users',       desc: 'View & manage user records', color: 'green' },
                    { table: 'zon_comments', label: 'Comments',    desc: 'Moderate game comments',    color: 'amber' },
                    { table: 'zon_ads',      label: 'Ads',         desc: 'Update advertisement slots', color: 'pink' },
                    { table: 'zon_pages',    label: 'Pages',       desc: 'Manage static pages',       color: 'teal' },
                    { table: 'zon_config',   label: 'Config',      desc: 'Site configuration',        color: 'indigo' },
                  ].map(item => (
                    <div key={item.table} className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 hover:border-white/10 bg-slate-900/20 hover:bg-slate-900/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-xs font-bold text-white">{item.label}</p>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <code className="text-[10px] text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded-md border border-white/5">{item.table}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { makeSlug } from '@/lib/utils';

export default function SearchDrawer() {
  const { searchOpen, setSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [suggestedGames, setSuggestedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input when drawer opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Load suggestions (categories and games) when drawer is opened
  useEffect(() => {
    if (!searchOpen) return;

    async function loadSuggestions() {
      try {
        // Fetch 6 random/popular categories
        const { data: catData } = await supabase
          .from('zon_category')
          .select('*')
          .limit(6);
          
        if (catData) {
          // Get sample game thumbnails and game counts for categories
          const enrichedCats = await Promise.all(
            catData.map(async (cat) => {
              const { data: gameData } = await supabase
                .from('zon_games')
                .select('game_image_url')
                .eq('game_category', cat.name.toLowerCase())
                .limit(1);
                
              const { count } = await supabase
                .from('zon_games')
                .select('*', { count: 'exact', head: true })
                .eq('game_category', cat.name.toLowerCase());
                
              return {
                ...cat,
                image: gameData?.[0]?.game_image_url || '/static/img/user_pic.png',
                count: count || 0
              };
            })
          );
          setSuggestedCategories(enrichedCats);
        }

        // Fetch 12 popular games
        const { data: gameData } = await supabase
          .from('zon_games')
          .select('*')
          .order('game_played', { ascending: false })
          .limit(12);
        if (gameData) {
          setSuggestedGames(gameData);
        }
      } catch (err) {
        console.error('Error loading search suggestions:', err);
      }
    }

    loadSuggestions();
  }, [searchOpen]);

  // Real-time search query matching
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('zon_games')
          .select('*')
          .ilike('game_name', `%${query}%`)
          .limit(20);
          
        if (data && !error) {
          setResults(data);
        }
      } catch (err) {
        console.error('Error searching games:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={() => { setSearchOpen(false); setQuery(''); }}
      />
      
      {/* Sliding Search Panel */}
      <div className="relative w-96 max-w-full h-full glass-panel-dark shadow-2xl flex flex-col p-6 animate-slide-in-right overflow-y-auto border-l border-white/5">
        {/* Close Button */}
        <button 
          onClick={() => { setSearchOpen(false); setQuery(''); }}
          aria-label="close search"
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-slate-700/50 transition-all focus:outline-none cursor-pointer"
        >
          <span className="text-xl font-medium text-slate-400 hover:text-white">&times;</span>
        </button>

        {/* Search Input Box */}
        <div className="mt-10 relative">
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you playing today?"
            className="w-full glass-input text-sm font-semibold rounded-xl h-11 px-4 pr-10"
          />
          <div className="absolute right-3 top-3 text-slate-400">
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </div>
        </div>

        {/* Results / Default lists */}
        <div className="mt-8 flex-1 flex flex-col">
          {query.trim().length > 0 ? (
            <div className="results-container flex-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Search Results ({results.length})</h2>
              {results.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {results.map((game) => (
                    <Link 
                      key={game.id}
                      href={`/g/${makeSlug(game.game_name)}`}
                      onClick={() => { setSearchOpen(false); setQuery(''); }}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/5">
                        <img 
                          src={game.game_image_url} 
                          alt={game.game_name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-white capitalize line-clamp-1 text-center w-full transition-colors">
                        {game.game_name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-white/5 p-4">
                  <h3 className="font-bold text-slate-300 text-sm">No games found</h3>
                  <p className="text-xs text-slate-500 mt-1">Try another search or browse suggestions below.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="suggestions flex-1 flex flex-col gap-6">
              {/* Category Suggestions */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Categories you might like</h3>
                <div className="flex flex-col gap-2">
                  {suggestedCategories.map((cat) => (
                    <Link 
                      key={cat.id}
                      href={`/${makeSlug(cat.name)}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 hover:bg-white/5 border border-transparent hover:border-white/5 p-2 rounded-xl transition-all"
                    >
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="h-10 w-10 rounded-lg object-cover bg-slate-900 border border-white/5"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-200 capitalize block">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{cat.count} games</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Game Suggestions */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Popular games</h3>
                <div className="grid grid-cols-4 gap-2.5">
                  {suggestedGames.map((game) => (
                    <Link 
                      key={game.id}
                      href={`/g/${makeSlug(game.game_name)}`}
                      onClick={() => setSearchOpen(false)}
                      className="group block aspect-square rounded-xl overflow-hidden border border-white/5"
                    >
                      <img 
                        src={game.game_image_url} 
                        alt={game.game_name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => { setSearchOpen(false); setQuery(''); }}
      />
      
      {/* Sliding Search Panel */}
      <div className="relative w-96 max-w-full h-full bg-white shadow-2xl flex flex-col p-6 animate-slide-in-right overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={() => { setSearchOpen(false); setQuery(''); }}
          aria-label="close search"
          className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <span className="text-2xl font-bold text-gray-500">&times;</span>
        </button>

        {/* Search Input Box */}
        <div className="mt-8 relative">
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you playing today?"
            className="w-full bg-gray-100 border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-[#002b50] rounded-2xl h-11 px-4 pr-10"
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </div>
        </div>

        {/* Results / Default lists */}
        <div className="mt-6 flex-1 flex flex-col">
          {query.trim().length > 0 ? (
            <div className="results-container flex-1">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Search Results ({results.length})</h2>
              {results.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {results.map((game) => (
                    <Link 
                      key={game.id}
                      href={`/g/${makeSlug(game.game_name)}`}
                      onClick={() => { setSearchOpen(false); setQuery(''); }}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <img 
                        src={game.game_image_url} 
                        alt={game.game_name} 
                        className="w-full aspect-square rounded-xl object-cover group-hover:scale-105 transition-transform shadow-sm"
                        onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
                      />
                      <span className="text-[10px] font-bold text-[#002b50] capitalize line-clamp-1 text-center w-full">
                        {game.game_name}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="font-bold text-gray-700">No games found</h3>
                  <p className="text-xs text-gray-400 mt-1">Try another search or browse suggestions below.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="suggestions flex-1 flex flex-col gap-6">
              {/* Category Suggestions */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories you might like</h3>
                <div className="flex flex-col gap-3">
                  {suggestedCategories.map((cat) => (
                    <Link 
                      key={cat.id}
                      href={`/${makeSlug(cat.name)}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors"
                    >
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <span className="text-sm font-bold text-[#002b50] capitalize block">{cat.name}</span>
                        <span className="text-xs text-gray-400">{cat.count} games</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Game Suggestions */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Popular games</h3>
                <div className="grid grid-cols-4 gap-2">
                  {suggestedGames.map((game) => (
                    <Link 
                      key={game.id}
                      href={`/g/${makeSlug(game.game_name)}`}
                      onClick={() => setSearchOpen(false)}
                      className="group flex flex-col items-center gap-1"
                    >
                      <img 
                        src={game.game_image_url} 
                        alt={game.game_name} 
                        className="w-full aspect-square rounded-lg object-cover group-hover:scale-105 transition-transform shadow-sm"
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

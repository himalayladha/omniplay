'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { makeSlug, formatNumber } from '@/lib/utils';
import GameCard from './GameCard';

export default function GamePlay({ game, relatedGames = [], initialLikes = 0, initialDislikes = 0, hasLiked = false, hasDisliked = false }) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [liked, setLiked] = useState(hasLiked);
  const [disliked, setDisliked] = useState(hasDisliked);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isGameBlocked, setIsGameBlocked] = useState(false);

  const containerRef = useRef(null);

  // Auto-increment game views & check if game is embeddable on mount
  useEffect(() => {
    async function initGamePage() {
      try {
        // Increment views
        fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: game.id }),
        }).catch(err => console.error('Error incrementing views:', err));

        // Check if game embedding is blocked
        const checkRes = await fetch('/api/check-game-embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: game.id }),
        });
        const checkData = await checkRes.json();
        
        if (checkData.success && checkData.active === false) {
          setIsGameBlocked(true);
          // Redirect to homepage after 5 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 5000);
        }
      } catch (err) {
        console.error('Error checking game status:', err);
      }
    }
    initGamePage();
  }, [game.id]);

  const handleLike = async () => {
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, action: 'like' }),
      });
      const data = await response.json();
      if (data.success) {
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setLiked(!liked);
        setDisliked(false);
      }
    } catch (err) {
      console.error('Error liking game:', err);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, action: 'dislike' }),
      });
      const data = await response.json();
      if (data.success) {
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setDisliked(!disliked);
        setLiked(false);
      }
    } catch (err) {
      console.error('Error disliking game:', err);
    }
  };

  const handleReport = async () => {
    if (!reportSubject.trim()) return;
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameId: game.id, 
          gameName: game.game_name, 
          problem: reportSubject 
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReportOpen(false);
        setReportSubject('');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error('Error reporting game:', err);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="flex flex-col gap-10 w-full" ref={containerRef}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 glass-panel border-green-500/30 text-green-400 px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-2 animate-slide-in-right">
          <span className="text-lg">😊</span>
          <span className="text-xs font-bold">Thank you! Your report has been submitted.</span>
        </div>
      )}

      {/* Report Bug Modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel-dark rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-white/5">
            <h3 className="font-bold text-base text-white mb-3 capitalize">Report bug for {game.game_name}</h3>
            <textarea 
              value={reportSubject}
              onChange={(e) => setReportSubject(e.target.value)}
              placeholder="Describe the bug or issue with the game..."
              className="w-full h-32 glass-input outline-none p-3.5 rounded-xl text-xs leading-relaxed"
            />
            <div className="flex justify-between items-center mt-5">
              <button 
                onClick={() => setReportOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleReport}
                className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                Send Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Game Column (Centers the screen, actions, and details at a comfortable desktop size) */}
      <div className="w-full max-w-[980px] mx-auto flex flex-col gap-6">
        {/* Gameplay Container */}
        <div className={`relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5 ${isFullscreen ? 'fixed inset-0 z-40 rounded-none w-screen h-screen border-none' : ''}`}>
          {isGameBlocked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 animate-pulse">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">Game Content Blocked</h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
                This game cannot be played because its distributor blocks embedding on this domain. 
                It has been automatically taken offline.
              </p>
              <div className="flex items-center gap-2 mt-6 px-3.5 py-2 rounded-xl bg-white/5 border border-white/5">
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Redirecting to Homepage...</span>
              </div>
            </div>
          ) : (
            <iframe 
              id="game" 
              src={game.game_url} 
              className="w-full h-full border-none"
              allowFullScreen
            />
          )}
          
          {/* Minimize Button in Fullscreen */}
          {isFullscreen && !isGameBlocked && (
            <button 
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-900/80 border border-white/10 text-white p-2.5 rounded-xl transition-all z-50 cursor-pointer"
              title="Minimize"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M33 6v9h9M15 6v9H6M15 42v-9H6M33 42v-9h9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Game Metadata Actions Panel */}
        <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <img 
              src={game.game_image_url} 
              alt={game.game_name} 
              className="h-12 w-12 rounded-2xl object-cover border border-white/10"
              onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
            />
            <div>
              <h1 className="font-extrabold text-base md:text-lg text-white capitalize leading-tight">{game.game_name}</h1>
              <Link 
                href={`/${makeSlug(game.game_category)}`}
                className="text-[10px] bg-gradient-to-r from-blue-400 to-indigo-400 -webkit-background-clip:text text-transparent font-black tracking-widest uppercase hover:opacity-80 transition-opacity mt-1 block"
              >
                {game.game_category} Games
              </Link>
            </div>
          </div>

          <div className="flex gap-2.5 items-center justify-end w-full md:w-auto">
            {/* Like Button */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleLike}
                className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all border cursor-pointer ${liked ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-950/40 hover:bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'}`}
                title="Like"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </button>
              <span className="text-xs font-bold text-slate-400 w-8 text-center">{formatNumber(likes)}</span>
            </div>

            {/* Dislike Button */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleDislike}
                className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all border cursor-pointer ${disliked ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-950/40 hover:bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'}`}
                title="Dislike"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                </svg>
              </button>
              <span className="text-xs font-bold text-slate-400 w-8 text-center">{formatNumber(dislikes)}</span>
            </div>

            <div className="h-5 w-[1px] bg-white/5 mx-1" />

            {/* Report Button */}
            <button 
              onClick={() => setReportOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-950/40 hover:bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Report a bug"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </button>

            {/* Full Screen Button */}
            <button 
              onClick={toggleFullscreen}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-950/40 hover:bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Full Screen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description container */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-2xl">
          <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Game Description</h2>
          <div className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
            {game.game_description}
          </div>
        </div>
      </div>

      {/* Related Games (Keep full-width grid layout for premium look) */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="h-5 w-1.5 rounded-full bg-blue-500" />
          <h2 className="text-xl font-bold tracking-tight text-white capitalize">Related Games</h2>
        </div>
        <div className="m-grid-start home grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {relatedGames.map((rg) => (
            <GameCard key={rg.id} game={rg} />
          ))}
        </div>
      </div>
    </div>
  );
}

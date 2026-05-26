'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { makeSlug, formatNumber } from '@/lib/utils';

export default function GamePlay({ game, relatedGames = [], initialLikes = 0, initialDislikes = 0, hasLiked = false, hasDisliked = false }) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [liked, setLiked] = useState(hasLiked);
  const [disliked, setDisliked] = useState(hasDisliked);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubject, setReportSubject] = useState('');
  const [showToast, setShowToast] = useState(false);

  const containerRef = useRef(null);

  // Auto-increment game views on mount
  useEffect(() => {
    async function incrementViews() {
      try {
        await fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: game.id }),
        });
      } catch (err) {
        console.error('Error incrementing views:', err);
      }
    }
    incrementViews();
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
    <div className="flex flex-col gap-6" ref={containerRef}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg z-50 animate-bounce">
          Thank you 😊
        </div>
      )}

      {/* Report Bug Modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="font-bold text-lg text-black mb-3">Report bug for {game.game_name}</h3>
            <textarea 
              value={reportSubject}
              onChange={(e) => setReportSubject(e.target.value)}
              placeholder="Describe the bug or issue with the game..."
              className="w-full h-32 border border-gray-200 outline-none p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={() => setReportOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-full"
              >
                Cancel
              </button>
              <button 
                onClick={handleReport}
                className="px-5 py-2 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm"
              >
                Send Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gameplay Container */}
      <div className={`relative w-full aspect-video rounded-3xl overflow-hidden shadow-md bg-black ${isFullscreen ? 'fixed inset-0 z-40 rounded-none w-screen h-screen' : ''}`}>
        <iframe 
          id="game" 
          src={game.game_url} 
          className="w-full h-full border-none"
          allowFullScreen
        />
        
        {/* Minimize Button in Fullscreen */}
        {isFullscreen && (
          <button 
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full transition-colors z-50"
            title="Minimize"
          >
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M33 6v9h9M15 6v9H6M15 42v-9H6M33 42v-9h9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Game Metadata Actions Panel */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <img 
            src={game.game_image_url} 
            alt={game.game_name} 
            className="h-12 w-12 rounded-xl object-cover"
          />
          <div>
            <h1 className="font-bold text-lg text-[#002b50] capitalize">{game.game_name}</h1>
            <Link 
              href={`/${makeSlug(game.game_category)}`}
              className="text-xs text-blue-500 font-bold hover:underline capitalize"
            >
              {game.game_category} Games
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-center justify-end w-full md:w-auto">
          {/* Like Button */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handleLike}
              className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${liked ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Like"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </button>
            <span className="text-xs font-bold text-gray-600">{formatNumber(likes)}</span>
          </div>

          {/* Dislike Button */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handleDislike}
              className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${disliked ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Dislike"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
              </svg>
            </button>
            <span className="text-xs font-bold text-gray-600">{formatNumber(dislikes)}</span>
          </div>

          <div className="h-6 w-[1px] bg-gray-200" />

          {/* Report Button */}
          <button 
            onClick={() => setReportOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            title="Report a bug"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>

          {/* Full Screen Button */}
          <button 
            onClick={toggleFullscreen}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            title="Full Screen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description container */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Game Description</h2>
        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {game.game_description}
        </div>
      </div>

      {/* Related Games */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#002b50] mb-4 capitalize">Related Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {relatedGames.map((rg) => (
            <div key={rg.id} className="hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md aspect-square bg-gray-100">
              <Link href={`/g/${makeSlug(rg.game_name)}`} className="block w-full h-full relative">
                <img 
                  src={rg.game_image_url} 
                  alt={rg.game_name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-[10px] font-bold capitalize line-clamp-1">{rg.game_name}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

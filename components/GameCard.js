import Link from 'next/link';
import { makeSlug } from '@/lib/utils';

export default function GameCard({ game }) {
  const cardSizeClass = game.game_card_size === 'md' ? 'md' : '';
  const featuredClass = game.is_featured === 1 ? 'lg' : '';

  // Handle absolute or relative image URLs
  const imageUrl = game.game_image_url || '/static/img/user_pic.png';

  return (
    <div 
      className="group relative cursor-pointer rounded-2xl overflow-hidden bg-slate-950/30 border border-white/5 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 active:scale-98"
      data-card-size={game.game_card_size === 'md' ? 'md' : ''}
      data-game-f={game.is_featured === 1 ? 'Yes' : 'No'}
    >
      <Link href={`/g/${makeSlug(game.game_name)}`} className="block w-full h-full relative">
        <div className="relative aspect-square overflow-hidden w-full h-full">
          <img 
            src={imageUrl} 
            alt={game.game_name}
            loading="lazy"
            className="w-full h-full object-cover bg-slate-900 group-hover:scale-108 transition-transform duration-500 ease-out"
            onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
          />
          {/* Glass-style bottom title overlay appearing on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <p className="text-white text-xs font-bold leading-tight capitalize line-clamp-2 w-full">
              {game.game_name}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

import Link from 'next/link';
import { makeSlug } from '@/lib/utils';

export default function GameCard({ game }) {
  const cardSizeClass = game.game_card_size === 'md' ? 'md' : '';
  const featuredClass = game.is_featured === 1 ? 'lg' : '';

  // Handle absolute or relative image URLs
  const imageUrl = game.game_image_url || '/static/img/user_pic.png';

  return (
    <div 
      className={`m-game-card ${cardSizeClass} ${featuredClass} cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md`}
      data-card-size={game.game_card_size === 'md' ? 'md' : ''}
      data-game-f={game.is_featured === 1 ? 'Yes' : 'No'}
    >
      <Link href={`/g/${makeSlug(game.game_name)}`} className="m-game-link block w-full h-full relative">
        <picture 
          style={{ backgroundImage: `url('${imageUrl}')` }} 
          className="m-game-thumbnail block w-full h-full bg-cover bg-center bg-no-repeat relative aspect-square"
        >
          <div className="m-game-details absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-xs font-bold capitalize line-clamp-2">
              {game.game_name}
            </p>
          </div>
        </picture>
      </Link>
    </div>
  );
}

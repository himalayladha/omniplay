import Link from 'next/link';
import { makeSlug } from '@/lib/utils';

export default function CategoryCard({ category, gameCount, sampleGameImageUrl }) {
  // Use a fallback category thumbnail image if none is provided
  const imageUrl = sampleGameImageUrl || '/static/img/user_pic.png';
  const categorySlug = makeSlug(category.name);

  return (
    <Link href={`/${categorySlug}`}>
      <div className="m-category-card hover:scale-102 hover:shadow-md active:scale-98 transition-all duration-300 bg-white rounded-2xl p-3 flex items-center gap-4 cursor-pointer">
        <img 
          src={imageUrl} 
          alt={category.name} 
          className="h-12 w-12 rounded-xl object-cover"
          onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
        />
        <div className="text flex-1">
          <span className="font-bold text-sm text-[#002b50] capitalize block">{category.name}</span>
          <p className="text-xs text-gray-500 font-medium">
            {gameCount} Games
          </p>
        </div>
      </div>
    </Link>
  );
}

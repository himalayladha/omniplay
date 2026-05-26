'use client';

import Link from 'next/link';
import { makeSlug } from '@/lib/utils';

export default function CategoryCard({ category, gameCount, sampleGameImageUrl }) {
  // Use a fallback category thumbnail image if none is provided
  const imageUrl = sampleGameImageUrl || '/static/img/user_pic.png';
  const categorySlug = makeSlug(category.name);

  return (
    <Link href={`/${categorySlug}`}>
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer">
        <img 
          src={imageUrl} 
          alt={category.name} 
          className="h-12 w-12 rounded-xl object-cover border border-white/5 bg-slate-900"
          onError={(e) => { e.target.src = '/static/img/user_pic.png'; }}
        />
        <div className="text flex-1">
          <span className="font-bold text-sm text-slate-100 capitalize block tracking-wide">{category.name}</span>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {gameCount} Games
          </p>
        </div>
      </div>
    </Link>
  );
}

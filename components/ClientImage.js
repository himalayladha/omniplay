'use client';

/**
 * ClientImage - a client-side wrapper for <img> that supports onError fallback.
 * Use this inside Server Components when you need image error handling.
 */
export default function ClientImage({ src, alt, className, fallback = '/static/img/user_pic.png', ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => { e.target.src = fallback; }}
      {...props}
    />
  );
}

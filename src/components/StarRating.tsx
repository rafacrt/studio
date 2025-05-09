import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showText?: boolean;
}

export function StarRating({
  rating,
  totalStars = 5,
  size = 16,
  className,
  showText = true,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="currentColor" strokeWidth={0} className="text-yellow-400" style={{ width: size, height: size }} />
      ))}
      {halfStar && (
        <Star key="half" fill="currentColor" strokeWidth={0} className="text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)', width: size, height: size }} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} fill="currentColor" strokeWidth={0} className="text-gray-300 dark:text-gray-600" style={{ width: size, height: size }} />
      ))}
      {showText && <span className="ml-1 text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>}
    </div>
  );
}

import { useState } from 'react';
import { StarIcon } from './icons';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function StarRating({ rating, setRating, size = 'md' }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const isInteractive = !!setRating;
  const displayRating = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-12 w-12 sm:h-16 sm:w-16',
  };

  const handleClick = (starValue: number) => {
    if (setRating) {
      setRating(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (isInteractive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(null);
    }
  };

  return (
    <div className="flex items-center" style={{ gap: '0.2rem' }}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <StarIcon
          key={starValue}
          className={`${sizeClasses[size]} ${
            starValue <= displayRating ? 'text-gray-300' : 'text-gray-300'
          } ${isInteractive ? 'cursor-pointer' : ''} transition-colors`}
          style={starValue <= displayRating ? { color: '#FE4D03' } : undefined}
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
}

export default StarRating;

"use client";
import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showLabel = false 
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  const handleClick = (starValue: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= (hoverRating || rating) 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-gray-200 text-gray-200'
          } ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => handleClick(star)}
        />
      ))}
      {showLabel && (
        <span className="ml-2 text-sm text-gray-600">
          ({rating}/5)
        </span>
      )}
    </div>
  );
};

export default StarRating;

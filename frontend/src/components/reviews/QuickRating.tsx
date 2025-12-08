// components/reviews/QuickRating.tsx
"use client";
import { useState } from "react";
import StarRating from "../ui/StarRating";
import { toast } from "react-hot-toast";

interface QuickRatingProps {
  productId: string;
  onOpen: (rating?: number) => void; // new: opens PostReviewModal
  onSuccess?: () => void;
}

const QuickRating = ({ productId, onOpen }: QuickRatingProps) => {
  const [rating, setRating] = useState(0);

  const handleRatingSelect = (selectedRating: number) => {
    // Instead of submitting directly, open the offline review modal with the rating prefilled.
    setRating(selectedRating);
    onOpen(selectedRating);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Rate this product</h3>
      <div className="flex items-center gap-3">
        <StarRating
          rating={rating}
          onRatingChange={handleRatingSelect}
          size="lg"
        />
        <span className="text-sm text-gray-600">
          {rating > 0 ? `You selected ${rating}/5` : "Click to rate"}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Ratings from product page are part of offline review flow — you'll be
        asked to add a photo/video before posting.
      </div>
    </div>
  );
};

export default QuickRating;

"use client";
import { useState } from "react";
import { useCreateReviewMutation } from "@/redux/services/user/reviewApi";
import StarRating from "../ui/StarRating";
import { toast } from "react-hot-toast";
import { createReviewSchema } from "@/lib/validations/review.schema";

interface QuickRatingProps {
  productId: string;
  onSuccess?: () => void;
}

const QuickRating = ({ productId, onSuccess }: QuickRatingProps) => {
  const [rating, setRating] = useState(0);
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleRatingSubmit = async (selectedRating: number) => {
    try {
      const reviewData = {
        productId,
        rating: selectedRating,
      };

      // ✅ Zod validation
      createReviewSchema.parse(reviewData);

      // ✅ API call
      await createReview(reviewData).unwrap();

      toast.success("Rating submitted successfully!");
      setRating(selectedRating);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to submit rating");
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Rate this product</h3>
      <div className="flex items-center gap-3">
        <StarRating
          rating={rating}
          onRatingChange={handleRatingSubmit}
          size="lg"
        />
        <span className="text-sm text-gray-600">
          {rating > 0 ? `You rated ${rating}/5` : "Click to rate"}
        </span>
      </div>
      {isLoading && (
        <div className="text-sm text-blue-600 mt-2">Submitting rating...</div>
      )}
    </div>
  );
};

export default QuickRating;

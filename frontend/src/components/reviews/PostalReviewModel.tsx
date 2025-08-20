// components/reviews/PostReviewModal.tsx
"use client";
import { useState } from "react";
import { useCreateReviewMutation } from "@/redux/services/user/reviewApi";
import StarRating from "../ui/StarRating";
import { toast } from "react-hot-toast";

interface PostReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const PostReviewModal = ({
  productId,
  isOpen,
  onClose,
  onSuccess,
}: PostReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const reviewData = {
        productId,
        rating,
        content: content.trim() || undefined,
        images: [],
        videos: [],
        isVerifiedPurchase: false,
      };

      await createReview(reviewData).unwrap();
      toast.success("Review posted successfully!");
      onClose();
      onSuccess?.();

      setRating(0);
      setContent("");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to post review");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Review (Optional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {content.length}/1000 characters
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Posting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostReviewModal;

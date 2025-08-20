// components/reviews/PostReviewModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "@/redux/services/user/reviewApi";
import StarRating from "../ui/StarRating";
import ActionButton from "../ui/ActionButton";
import { toast } from "react-hot-toast";
import { ReviewDisplayType } from "@/types/review";
import { Send, X } from "lucide-react";

interface PostReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingReview?: ReviewDisplayType | null;
}

const PostReviewModal: React.FC<PostReviewModalProps> = ({
  productId,
  isOpen,
  onClose,
  onSuccess,
  existingReview = null,
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const isEditing = !!existingReview;
  const isLoading = isCreating || isUpdating;

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating);
        setContent(existingReview.content || "");
      } else {
        setRating(0);
        setContent("");
      }
    }
  }, [existingReview, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const reviewData = {
        rating,
        content: content.trim() || undefined,
        images: [],
        videos: [],
        isVerifiedPurchase: true,
      };

      if (isEditing && existingReview) {
        await updateReview({
          reviewId: existingReview._id,
          ...reviewData,
        }).unwrap();
        toast.success("Review updated successfully!");
      } else {
        await createReview({ productId, ...reviewData }).unwrap();
        toast.success("Review posted successfully!");
      }

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.data?.message ||
          `Failed to ${isEditing ? "update" : "post"} review`
      );
    }
  };

  const handleClose = () => {
    setRating(0);
    setContent("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Modal Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </h2>
          <ActionButton
            icon={X}
            variant="secondary"
            size="sm"
            onClick={handleClose}
            className="!p-1"
            aria-label="Close modal"
          />
        </header>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-900">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
              {rating > 0 && (
                <span className="text-sm text-gray-600">({rating}/5)</span>
              )}
            </div>
          </div>

          {/* Review Content */}
          <div>
            <label
              htmlFor="review-content"
              className="block text-sm font-semibold mb-2 text-gray-900"
            >
              Your Review (Optional)
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience with this product. What did you like or dislike?"
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-2 flex justify-between">
              <span>Help others by sharing your detailed experience</span>
              <span className={content.length > 800 ? "text-orange-500" : ""}>
                {content.length}/1000
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <ActionButton
              type="button"
              icon={X}
              label="Cancel"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            />
            <ActionButton
              type="submit"
              icon={Send}
              label={isEditing ? "Update Review" : "Post Review"}
              variant="primary"
              disabled={rating === 0}
              isLoading={isLoading}
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostReviewModal;

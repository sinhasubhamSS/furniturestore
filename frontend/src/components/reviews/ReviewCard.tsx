// components/reviews/ReviewCard.tsx
"use client";
import React, { useState } from "react";
import StarRating from "../ui/StarRating";
import ActionButton from "../ui/ActionButton";
import { ReviewDisplayType } from "@/types/review";
import { useDeleteReviewMutation } from "@/redux/services/user/reviewApi";
import { Edit, Trash2, ThumbsUp } from "lucide-react";
import { toast } from "react-hot-toast";

interface ReviewCardProps {
  review: ReviewDisplayType;
  currentUserId?: string;
  onEdit?: (review: ReviewDisplayType) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
}) => {
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwner = currentUserId === review.userId._id;

  // ✅ Add null check for review.content
  const reviewContent = review.content || ""; // Default to empty string
  const shouldTruncate = reviewContent && reviewContent.length > 200;
  const displayContent =
    shouldTruncate && !isExpanded
      ? `${reviewContent.substring(0, 200)}...` // ✅ Use reviewContent instead
      : reviewContent; // ✅ Use reviewContent instead

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteReview({ reviewId: review._id }).unwrap();
      toast.success("Review deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete review");
    }
  };

  const handleHelpfulClick = () => {
    toast("Helpful feature coming soon!");
  };

  return (
    <article className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
      <div className="flex gap-4">
        {/* User Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          {review.userId.avatar ? (
            <img
              src={review.userId.avatar}
              alt={`${review.userId.name}'s avatar`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span
              className="text-white font-bold text-sm"
              aria-label={`${review.userId.name}'s initial`}
            >
              {review.userId.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Review Header */}
          <header className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-gray-900 text-sm">
                {review.userId.name}
              </h4>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-xs text-gray-500">
                  ({review.rating}/5)
                </span>
              </div>
              {review.isVerifiedPurchase && (
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  ✓ Verified Buyer
                </span>
              )}
            </div>
            <time className="text-xs text-gray-500" dateTime={review.createdAt}>
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </time>
          </header>

          {/* ✅ Review Content with proper null check */}
          {reviewContent && (
            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {displayContent}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium mt-2 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          )}

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div
              className="flex gap-2 mb-4"
              role="list"
              aria-label="Review images"
            >
              {review.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.caption || `Review image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
                  role="listitem"
                />
              ))}
              {review.images.length > 4 && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500">
                    +{review.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <footer className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ActionButton
                icon={ThumbsUp}
                label={`Helpful (${review.helpfulVotes})`}
                variant="secondary"
                size="sm"
                onClick={handleHelpfulClick}
              />
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <ActionButton
                  icon={Edit}
                  label="Edit"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit?.(review)}
                />
                <ActionButton
                  icon={Trash2}
                  label="Delete"
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                />
              </div>
            )}
          </footer>
        </div>
      </div>
    </article>
  );
};

export default ReviewCard;

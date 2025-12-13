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

  const reviewContent = review.content || "";
  const shouldTruncate = reviewContent.length > 200;
  const displayContent =
    shouldTruncate && !isExpanded
      ? reviewContent.substring(0, 200) + "..."
      : reviewContent;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteReview({ reviewId: review._id }).unwrap();
      toast.success("Review deleted successfully!");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <article className="border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition mb-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
          {review.userId.avatar ? (
            <img
              src={review.userId.avatar}
              alt={`${review.userId.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">
              {review.userId.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          {/* HEADER */}
          <header className="mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Name + Date */}
              <div className="flex flex-col leading-tight">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {review.userId.name}
                </h4>

                <time
                  className="text-[11px] text-gray-500"
                  dateTime={review.createdAt}
                >
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-xs text-gray-500">
                  ({review.rating}/5)
                </span>
              </div>

              {/* Verified Badge */}
              {review.isVerifiedPurchase && (
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-[10px] font-medium">
                  ✓ Verified Buyer
                </span>
              )}
            </div>
          </header>

          {/* REVIEW TEXT */}
          {reviewContent && (
            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {displayContent}
              </p>

              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium mt-2"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          )}

          {/* Review Images */}
          {Array.isArray(review.images) && review.images.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {review.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.caption || `Review image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors cursor-pointer"
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

          <footer className="flex justify-between items-center">
            <ActionButton
              icon={ThumbsUp}
              label=""
              variant="secondary"
              size="sm"
              onClick={() => toast("Helpful feature coming soon!")}
              className="!p-2"
            />

            {isOwner && (
              <div className="flex gap-2">
                <ActionButton
                  icon={Edit}
                  label=""
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit?.(review)}
                  className="!p-2"
                />

                <ActionButton
                  icon={Trash2}
                  label=""
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  className="!p-2"
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

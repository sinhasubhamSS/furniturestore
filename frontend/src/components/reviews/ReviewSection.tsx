// components/reviews/ReviewsSection.tsx
"use client";
import { useState } from "react";
import { useGetProductReviewsQuery } from "@/redux/services/user/reviewApi";
import ReviewCard from "./ReviewCard";
import { ReviewDisplayType } from "@/types/review";
import PostReviewModal from "./PostReviewModel";

interface ReviewsSectionProps {
  productId: string;
  currentUserId?: string | null;
}

const ReviewsSection = ({ productId, currentUserId }: ReviewsSectionProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDisplayType | null>(
    null
  );

  const {
    data: reviewsData,
    isLoading,
    error,
  } = useGetProductReviewsQuery({
    productId,
    page: currentPage,
    limit: showAllReviews ? 10 : 3,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const hasReviews = reviewsData?.reviews && reviewsData.reviews.length > 0;
  const totalReviews = reviewsData?.pagination?.totalReviews || 0;

  // helper to create a stable key per review
  const makeReviewKey = (review: any, index: number) => {
    // prefer official _id
    if (
      review &&
      (typeof review._id === "string" || typeof review._id === "number")
    ) {
      return String(review._id);
    }
    // fallback to combination of user id + createdAt (likely unique)
    if (review && review.userId && (review.userId._id || review.userId)) {
      const uid = review.userId._id || review.userId;
      if (review.createdAt) return `${String(uid)}-${String(review.createdAt)}`;
      return `${String(uid)}-${index}`;
    }
    // last resort: index based key (keeps React warning gone but not ideal for reordering)
    return `review-fallback-${index}`;
  };

  // Optional: debug missing _id items in dev environment
  if (process.env.NODE_ENV !== "production" && hasReviews) {
    const missing = (reviewsData!.reviews || []).filter(
      (r: any) => !r || (!r._id && !(r.userId && (r.userId._id || r.userId)))
    );
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.warn(
        "ReviewsSection: some reviews missing _id (fallback keys used):",
        missing
      );
    }
  }

  return (
    <section className="mt-8">
      <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Customer Reviews
            </h2>
            {totalReviews > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </p>
            )}
          </div>

          {/* Only the Add Offline Review button on product page */}
          <div>
            <button
              onClick={() => {
                setEditingReview(null);
                setShowReviewModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              title="Add an offline review (photo/video required)"
            >
              Add Offline Review
            </button>
          </div>
        </div>

        {/* Reviews Display */}
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">Loading reviews...</div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading reviews</p>
            </div>
          ) : !hasReviews ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405L3 21l2.595-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500">
                Be the first to review this product!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reviewsData!.reviews.map(
                  (review: ReviewDisplayType, idx: number) => (
                    <ReviewCard
                      key={makeReviewKey(review as any, idx)}
                      review={review}
                      currentUserId={currentUserId || undefined}
                      onEdit={(r) => {
                        setEditingReview(r);
                        setShowReviewModal(true);
                      }}
                    />
                  )
                )}
              </div>

              {/* View More/Less Toggle */}
              {totalReviews > 3 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setShowAllReviews(!showAllReviews);
                      setCurrentPage(1);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    {showAllReviews
                      ? "Show Less Reviews"
                      : `View All ${totalReviews} Reviews`}
                  </button>
                </div>
              )}

              {/* Pagination */}
              {showAllReviews && reviewsData!.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={!reviewsData!.pagination.hasPrev}
                    className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {reviewsData!.pagination.currentPage} of{" "}
                    {reviewsData!.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={!reviewsData!.pagination.hasNext}
                    className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Modal (product-page offline-only) */}
      <PostReviewModal
        productId={productId}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        onSuccess={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        existingReview={editingReview}
        // Note: product page does NOT pass orderId => offline flow enforced
      />
    </section>
  );
};

export default ReviewsSection;

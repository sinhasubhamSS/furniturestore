// components/reviews/ReviewsSection.tsx
"use client";
import { useState } from "react";
import { useGetProductReviewsQuery } from "@/redux/services/user/reviewApi";
import StarRating from "../ui/StarRating";
import QuickRating from "./QuickRating";
 // ✅ Fixed import path
import ReviewCard from "./ReviewCard"; // ✅ Add this import
import { ReviewDisplayType } from "@/types/review";
import PostReviewModal from "./PostReviewModel";

interface ReviewsSectionProps {
  productId: string;
  currentUserId?: string; // ✅ Add currentUserId prop
}

const ReviewsSection = ({ productId, currentUserId }: ReviewsSectionProps) => {
  // ✅ All state declarations inside component
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "rating" | "helpfulVotes">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDisplayType | null>(
    null
  ); // ✅ Add editing state

  const {
    data: reviewsData,
    isLoading,
    error,
  } = useGetProductReviewsQuery({
    productId,
    page: currentPage,
    limit: showAllReviews ? 10 : 3,
    sortBy,
    sortOrder,
  });

  const hasReviews = reviewsData?.reviews && reviewsData.reviews.length > 0;
  const totalReviews = reviewsData?.pagination?.totalReviews || 0;

  return (
    <section className="mt-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
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

            {/* Sort Options */}
            {hasReviews && showAllReviews && (
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field as "createdAt" | "rating" | "helpfulVotes");
                  setSortOrder(order as "asc" | "desc");
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
                <option value="helpfulVotes-desc">Most Helpful</option>
              </select>
            )}
          </div>
        </div>

        {/* Create Review Section */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <QuickRating
                productId={productId}
                onSuccess={() => {
                  console.log("Rating submitted!");
                }}
              />
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Write Review
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Display */}
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
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
              {/* ✅ Reviews List with Edit Support */}
              <div className="space-y-4">
                {reviewsData.reviews.map((review: ReviewDisplayType) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    currentUserId={currentUserId || "guest"} // ✅ Pass user ID
                    onEdit={(review) => {
                      // ✅ Edit handler
                      setEditingReview(review);
                      setShowReviewModal(true);
                    }}
                  />
                ))}
              </div>

              {/* View More/Less Toggle */}
              {totalReviews > 3 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setShowAllReviews(!showAllReviews);
                      if (showAllReviews) {
                        setCurrentPage(1);
                      }
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {showAllReviews
                      ? "Show Less Reviews"
                      : `View All ${totalReviews} Reviews`}
                  </button>
                </div>
              )}

              {/* Pagination */}
              {showAllReviews && reviewsData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={!reviewsData.pagination.hasPrev}
                    className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {reviewsData.pagination.currentPage} of{" "}
                    {reviewsData.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={!reviewsData.pagination.hasNext}
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

      {/* ✅ Review Modal with Edit Support */}
      <PostReviewModal
        productId={productId}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null); // ✅ Clear editing state
        }}
        onSuccess={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        existingReview={editingReview} // ✅ Pass editing review
      />
    </section>
  );
};

export default ReviewsSection;

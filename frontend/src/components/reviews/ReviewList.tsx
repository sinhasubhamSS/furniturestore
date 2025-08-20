// components/reviews/ReviewsSection.tsx
"use client";
import { useState } from "react";
import { useGetProductReviewsQuery } from "@/redux/services/user/reviewApi";
import StarRating from "../ui/StarRating";
import QuickRating from "./QuickRating";

import { ReviewDisplayType } from "@/types/review";
import PostReviewModal from "./PostalReviewModel";

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection = ({ productId }: ReviewsSectionProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "rating" | "helpfulVotes">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const {
    data: reviewsData,
    isLoading,
    error,
  } = useGetProductReviewsQuery({
    productId,
    page: currentPage,
    limit: showAllReviews ? 10 : 3, // Show 3 initially, 10 when expanded
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
              <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
              {totalReviews > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              )}
            </div>
            
            {/* Sort Options - Only show if reviews exist */}
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
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405L3 21l2.595-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to review this product!</p>
            </div>
          ) : (
            <>
              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsData.reviews.map((review: ReviewDisplayType) => (
                  <ReviewCard key={review._id} review={review} />
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
                      : `View All ${totalReviews} Reviews`
                    }
                  </button>
                </div>
              )}

              {/* Pagination - Only show when viewing all reviews */}
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
                    Page {reviewsData.pagination.currentPage} of {reviewsData.pagination.totalPages}
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

      {/* Review Modal */}
      <PostReviewModal
        productId={productId}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={() => {
          console.log("Review posted!");
          setShowReviewModal(false);
        }}
      />
    </section>
  );
};

// Minimalistic Review Card
const ReviewCard = ({ review }: { review: ReviewDisplayType }) => {
  return (
    <div className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          {review.userId.avatar ? (
            <img
              src={review.userId.avatar}
              alt={review.userId.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium text-sm">
              {review.userId.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h4 className="font-medium text-gray-900 text-sm">
                {review.userId.name}
              </h4>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} readonly size="sm" />
                {review.isVerifiedPurchase && (
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            <time className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </time>
          </div>

          {/* Review Content */}
          {review.content && (
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {review.content}
            </p>
          )}

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.caption || "Review image"}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                />
              ))}
              {review.images.length > 4 && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{review.images.length - 4}</span>
                </div>
              )}
            </div>
          )}

          {/* Helpful Votes */}
          {review.helpfulVotes > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <span>👍</span>
                <span>{review.helpfulVotes} found helpful</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;

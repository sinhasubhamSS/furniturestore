// components/MyOrders.tsx
"use client";

import React from "react";
import Image from "next/image"; // kept import if other usages exist (optional)
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} from "@/redux/services/user/orderApi";
import { formatDate } from "../../../../utils/formatDate";
import Button from "@/components/ui/Button";
import PostReviewModal from "@/components/reviews/PostReviewModel";
import { Order } from "@/types/order";
import { RootState } from "@/redux/store";

const PLACEHOLDER = "/placeholder.png";

const MyOrders: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useGetMyOrdersQuery({
    page: currentPage,
    limit: 10,
  });

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  // redux user (in case you want to show edit/delete only for owner etc.)
  const currentUser = useSelector((s: RootState) => s.user.activeUser);

  // modal state for verified (online) reviews
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [activeProductId, setActiveProductId] = React.useState<string | null>(
    null
  );
  const [activeOrderId, setActiveOrderId] = React.useState<string | null>(null);

  // track broken image srcs to force fallback (optional optimization)
  const [brokenImages, setBrokenImages] = React.useState<Record<string, boolean>>(
    {}
  );

  // Debug: log full backend payload
  React.useEffect(() => {
    if (!data) return;
    console.log("🔍 FULL ORDERS RESPONSE:", data);
    if (data.orders?.length > 0) {
      console.log("🔍 FIRST ORDER:", data.orders[0]);
      console.log("🔍 orderItemsSnapshot:", data.orders[0].orderItemsSnapshot);
      console.log("🔍 productPreview:", data.orders[0].productPreview);
    }
  }, [data]);

  // Safe productId extractor (prefers orderItemsSummary -> productPreview -> snapshot)
  const extractFirstProductId = (order: any): string | null => {
    // prioritized: orderItemsSummary (compact)
    if (
      Array.isArray(order?.orderItemsSummary) &&
      order.orderItemsSummary.length > 0
    ) {
      const first = order.orderItemsSummary[0];
      if (first?.productId) return String(first.productId);
    }

    // next: orderItemsSnapshot (raw)
    const list = order?.orderItemsSnapshot;
    if (Array.isArray(list) && list.length > 0) {
      const first = list[0];
      if (typeof first.productId === "string") return first.productId;
      if (first.productId?._id) return String(first.productId._id);
      if (first.productId?.id) return String(first.productId.id);
      if (first._id) return String(first._id);
    }

    // fallback: productPreview
    const preview = order?.productPreview;
    if (preview) {
      if (typeof preview.productId === "string") return preview.productId;
      if (preview._id) return String(preview._id);
      if (preview.id) return String(preview.id);
    }

    return null;
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder({ orderId }).unwrap();
      alert("Order cancelled successfully.");
      refetch();
    } catch (err: unknown) {
      alert(
        (err as { data?: { message?: string } })?.data?.message ||
          "Failed to cancel order"
      );
    }
  };

  const isReturnEligible = (order: Order) => {
    if (String(order.status ?? "").toLowerCase() !== "delivered") return false;
    if (!order.placedAt) return false;

    const deliveredDate = new Date(order.placedAt);
    const now = new Date();
    const days =
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

    return days <= 7;
  };

  const handleReturn = (orderId: string) => {
    router.push(`/return/${orderId}`);
  };

  // returns a safe preview url or placeholder
  const getPreviewImage = (images: any) => {
    if (!images) return PLACEHOLDER;
    if (Array.isArray(images)) return images[0] ?? PLACEHOLDER;
    if (typeof images === "string" && images.length > 0) return images;
    return PLACEHOLDER;
  };

  // Handler to open verified review modal
  const openVerifiedReview = (order: any) => {
    const pid =
      (order.productPreview && order.productPreview.productId) ??
      (order.orderItemsSummary && order.orderItemsSummary[0]?.productId) ??
      extractFirstProductId(order);

    // pick orderId: external orderId (e.g. SUVI-...) else fallback to DB _id
    const oid = order.orderId ?? order._id ?? null;

    if (!pid) {
      // fallback: ask user to open order-details — but ideally backend always sends productId
      alert(
        "Product ID not available. Please open order details to write a review."
      );
      return;
    }

    // Debug: show exactly what we will pass into modal
    console.log("openVerifiedReview -> productId:", pid, "orderId:", oid);

    setActiveProductId(String(pid));
    setActiveOrderId(oid ? String(oid) : null);
    setShowReviewModal(true);
  };

  // small helper: when native img fails, mark and fallback
  const handleImgError = (srcKey: string) => {
    setBrokenImages((prev) => ({ ...prev, [srcKey]: true }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error loading orders</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-xl font-bold mb-4">My Orders</h1>

        {/* Orders List */}
        <div className="space-y-3">
          {orders.map((order: Order) => {
            const placedAtDate = order.placedAt
              ? new Date(order.placedAt)
              : null;

            const canCancel =
              String(order.status).toLowerCase() !== "cancelled" &&
              String(order.status).toLowerCase() !== "delivered" &&
              placedAtDate &&
              (new Date().getTime() - placedAtDate.getTime()) /
                (1000 * 60 * 60) <=
                12;

            const canReturn = isReturnEligible(order);

            const previewImg = getPreviewImage(order.productPreview?.images);
            const imgKey = String(previewImg) + (order.orderId ?? order._id ?? "");

            return (
              <div
                key={order._id ?? order.orderId}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="p-3">
                  {/* Order Header */}
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">
                        Order ID: {order.orderId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {placedAtDate
                          ? formatDate(placedAtDate.toISOString())
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        {String(order.status).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="flex items-center gap-3">
                    {/* Use native img with onError fallback to avoid Next optimizer upstream 404 errors */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border p-2">
                      <img
                        src={brokenImages[imgKey] ? PLACEHOLDER : previewImg}
                        alt={order.productPreview?.name || "product"}
                        width={64}
                        height={64}
                        className="rounded object-contain"
                        onError={() => handleImgError(imgKey)}
                      />
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">
                        {order.productPreview?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Items: {order.productPreview?.quantity}
                      </p>
                    </div>

                    <p className="font-bold text-base">
                      ₹{order.totalAmount.toFixed(0)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t">
                    {/* Give Review if delivered */}
                    {String(order.status).toLowerCase() === "delivered" && (
                      <Button
                        onClick={() => {
                          // LOG right at click-time so we see what the UI had
                          console.log("Give Review clicked — order snapshot:", {
                            orderId: order.orderId,
                            _id: order._id,
                            productPreview: order.productPreview,
                            orderItemsSummary: (order as any).orderItemsSummary,
                          });
                          openVerifiedReview(order);
                        }}
                        className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Give Review
                      </Button>
                    )}

                    {/* Return Button */}
                    {canReturn && (
                      <Button
                        onClick={() => handleReturn(order.orderId!)}
                        className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Return
                      </Button>
                    )}

                    {/* Cancel Button */}
                    {canCancel && (
                      <Button
                        onClick={() => handleCancel(order.orderId!)}
                        disabled={isCancelling}
                        className="text-xs px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {isCancelling ? "Cancelling..." : "Cancel"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              variant="outline"
            >
              Previous
            </Button>

            <span>
              Page {pagination.page} of {pagination.pages}
            </span>

            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* PostReviewModal - opens for verified (online) reviews */}
      {activeProductId && (
        <PostReviewModal
          productId={activeProductId}
          orderId={activeOrderId ?? undefined}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setActiveProductId(null);
            setActiveOrderId(null);
          }}
          onSuccess={() => {
            // close and refresh orders so UI can show reviewed state if backend updates it
            setShowReviewModal(false);
            setActiveProductId(null);
            setActiveOrderId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default MyOrders;

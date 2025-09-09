"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} from "@/redux/services/user/orderApi";
import { formatDate } from "../../../../utils/formatDate";
import Button from "@/components/ui/Button";
import { Order } from "@/types/order";

const MyOrders = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data, isLoading, error, refetch } = useGetMyOrdersQuery({
    page: currentPage,
    limit: 10,
  });

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const handleCancel = async (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder({ orderId }).unwrap();
        alert("Order cancelled successfully.");
        refetch();
      } catch (err: unknown) {
        // Use unknown and narrow type safely
        alert(
          (err as { data?: { message?: string } })?.data?.message ||
            "Failed to cancel order"
        );
      }
    }
  };

  const isReturnEligible = (order: Order) => {
    if (order.status !== "delivered") return false;
    if (order.hasActiveReturn) return false;

    const deliveredDate = new Date(order.placedAt);
    const now = new Date();
    const daysSinceDelivery =
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceDelivery <= 7;
  };

  const handleReturn = (orderId: string) => {
    router.push(`/return/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
        <div className="text-center bg-[var(--color-card)] p-6 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-[var(--color-accent)] mx-auto"></div>
          <p className="mt-3 text-[var(--color-foreground)] font-medium text-sm">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
        <div className="text-center bg-[var(--color-card)] p-6 rounded-xl shadow-lg">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-[var(--text-error)] font-semibold text-sm mb-3">
            Failed to load orders
          </p>
          <Button onClick={() => refetch()} className="text-sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
        <div className="text-center bg-[var(--color-card)] p-6 rounded-xl shadow-lg max-w-sm">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold mb-3 text-[var(--color-foreground)]">
            No orders yet
          </h2>
          <p className="text-[var(--text-accent)] mb-4 text-sm">
            Start shopping to see your orders here!
          </p>
          <Button
            onClick={() => router.push("/products")}
            className="w-full py-3"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-4">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
              My Orders
            </h1>
            <Button
              variant="ghost"
              onClick={() => router.push("/products")}
              className="hidden sm:flex items-center gap-1 text-sm"
            >
              ← Continue Shopping
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/products")}
            className="sm:hidden w-full mt-2 py-2 text-sm"
          >
            ← Continue Shopping
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {orders.map((order: Order) => {
            const placedAtDate = new Date(order.placedAt);
            const now = new Date();
            const hoursSincePlaced =
              (now.getTime() - placedAtDate.getTime()) / (1000 * 60 * 60);

            const canCancel =
              order.status !== "cancelled" &&
              order.status !== "delivered" &&
              hoursSincePlaced <= 12;
            const canReturn = isReturnEligible(order);

            return (
              <div
                key={order.orderId || order._id}
                className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border-custom)] hover:shadow-md transition-shadow"
              >
                <div className="p-3">
                  {/* Header Info */}
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[var(--color-foreground)] text-sm">
                        Order ID: {order.orderId}
                      </p>
                      <p className="text-xs text-[var(--text-accent)]">
                        {formatDate(order.placedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-secondary)] flex items-center justify-center border border-[var(--color-border-custom)] p-2">
                      <Image
                        src={order.productPreview?.images || "/placeholder.png"}
                        alt={order.productPreview?.name || "Product"}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--color-foreground)] text-sm truncate">
                        {order.productPreview?.name}
                      </p>
                      <p className="text-xs text-[var(--text-accent)]">
                        Items: {order.productPreview?.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-[var(--color-foreground)] text-base">
                      ₹{order.totalAmount.toFixed(0)}
                    </p>
                  </div>

                  {/* Return Status */}
                  {order.hasActiveReturn && order.returnInfo && (
                    <div className="mt-2 bg-yellow-100 border border-yellow-200 rounded p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-yellow-800">
                            Return Status:{" "}
                            {order.returnInfo.returnStatus.toUpperCase()}
                          </p>
                          <p className="text-xs text-yellow-600">
                            Return ID: {order.returnInfo.returnId}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            router.push(
                              `/return-tracking/${order.returnInfo?.returnId}`
                            )
                          }
                          className="text-xs px-2 py-1"
                          variant="outline"
                        >
                          Track
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 justify-end mt-3 pt-2 border-t border-[var(--color-border-custom)]">
                    <Button
                      onClick={() =>
                        router.push(`/order-details/${order.orderId}`)
                      }
                      variant="outline"
                      className="text-xs px-3 py-1"
                    >
                      View Details
                    </Button>

                    {canReturn && !order.hasActiveReturn && (
                      <Button
                        onClick={() => handleReturn(order.orderId!)}
                        className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Return
                      </Button>
                    )}

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
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              variant="outline"
              className="text-sm px-3 py-2"
            >
              Previous
            </Button>
            <span className="text-sm text-[var(--color-foreground)]">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              variant="outline"
              className="text-sm px-3 py-2"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

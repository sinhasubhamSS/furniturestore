"use client";

import WishlistItem from "@/components/wishlist/wishlishtComponent";
import { useGetWishlistWithProductsQuery } from "@/redux/services/user/wishlistApi";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { WishlistItemType } from "@/types/Product";
import { useWishlist } from "@/hooks/useWishlist";

const WishlistPage = () => {
  const {
    data: wishlistItems = [],
    isLoading,
    isError,
    refetch,
  } = useGetWishlistWithProductsQuery();

  const { toggleWishlist } = useWishlist();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-sm">
        Loading your wishlist…
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Something went wrong.
      </div>
    );

  if (!wishlistItems.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-2">
        <h2 className="text-lg font-semibold">Your wishlist is empty</h2>
        <p className="text-sm text-gray-500">
          Products you save will appear here
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      <div className="max-w-4xl mx-auto px-2">
        {/* HEADER */}
        <div className="py-4 flex items-center justify-between border-b">
          <h1 className="text-lg font-semibold">My Wishlist</h1>
          <span className="text-xs text-gray-600">
            {wishlistItems.length} items
          </span>
        </div>

        {/* LIST */}
        <div className="divide-y">
          {wishlistItems.map((item: WishlistItemType) => (
            <WishlistItem
              key={`${item.product._id}-${item.variantId}`}
              product={item.product}
              variantId={item.variantId}
              onRemove={async () => {
                await toggleWishlist(item.product._id, item.variantId);
                refetch();
              }}
              onAddToCart={() =>
                addToCart({
                  productId: item.product._id,
                  variantId: item.variantId,
                  quantity: 1,
                })
              }
              isAdding={isAdding}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;

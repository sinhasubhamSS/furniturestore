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
      <div className="min-h-screen flex items-center justify-center text-lg animate-pulse">
        Loading your wishlist...
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Something went wrong. Please try again.
      </div>
    );

  if (!wishlistItems.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-3 px-4">
        <h2 className="text-2xl font-semibold">Your wishlist is empty 💔</h2>
        <p className="text-sm text-gray-500">
          Save products you like and they’ll appear here
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-6">
      {/* 🔥 Wider container for large screens */}
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Header */}
        <div className="py-4 flex items-center justify-between border-b">
          <h1 className="text-xl md:text-2xl font-bold">My Wishlist</h1>
          <span className="text-sm bg-black text-white px-3 py-1 rounded-full">
            {wishlistItems.length}
          </span>
        </div>

        {/* Grid tuned for UX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 py-5">
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

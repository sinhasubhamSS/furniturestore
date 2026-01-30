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
      <div className="min-h-screen flex items-center justify-center">
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
        <h2 className="text-xl font-semibold">Your wishlist is empty 💔</h2>
        <p className="text-sm text-gray-500">
          Products you save will appear here
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-10">
      <div className="max-w-[1600px] mx-auto px-4">
        {/* Header */}
        <div className="py-5 flex items-center justify-between border-b">
          <h1 className="text-xl md:text-2xl font-semibold">My Wishlist</h1>
          <span className="text-xs bg-black text-white px-3 py-1 rounded-full">
            {wishlistItems.length}
          </span>
        </div>

        {/* GRID – FINAL FIX */}
        <div
          className="
            grid
            grid-cols-1        /* Mobile */
            md:grid-cols-1     /* Tablet */
            lg:grid-cols-3     /* Laptop */
            xl:grid-cols-4     /* Desktop */
            2xl:grid-cols-5    /* Big screen */
            gap-4
            pt-6
          "
        >
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

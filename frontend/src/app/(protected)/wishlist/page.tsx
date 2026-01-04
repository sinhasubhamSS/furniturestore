"use client";

import WishlistItem from "@/components/wishlist/wishlishtComponent";
import { useGetWishlistWithProductsQuery } from "@/redux/services/user/wishlistApi";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { WishlistItemType } from "@/types/Product";
import { useWishlist } from "@/hooks/useWishlist"; // 🔥 USE HOOK

const WishlistPage = () => {
  const {
    data: wishlistItems = [],
    isLoading,
    isError,
    refetch,
  } = useGetWishlistWithProductsQuery();

  const { toggleWishlist } = useWishlist(); // 🔥 CONSISTENT LOGIC
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading wishlist</p>;

  if (!wishlistItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Wishlist empty
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">My Wishlist</h1>
          <span>{wishlistItems.length}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {wishlistItems.map((item: WishlistItemType) => (
            <WishlistItem
              key={`${item.product._id}-${item.variantId}`}
              product={item.product}
              variantId={item.variantId}
              onRemove={async () => {
                await toggleWishlist(item.product._id, item.variantId);

                refetch(); // 🔥 sync heavy list
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

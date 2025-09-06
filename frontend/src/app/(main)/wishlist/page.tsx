"use client";

import WishlistItem from "@/components/wishlist/wishlishtComponent";
import { useGetWishlistWithProductsQuery } from "@/redux/services/user/wishlistApi";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { useWishlistManager } from "@/hooks/useWishlistManger";
import { DisplayProduct } from "@/types/Product";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const WishlistPage = () => {
  const {
    data: wishlistProducts = [],
    isLoading,
    isError,
  } = useGetWishlistWithProductsQuery();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const router = useRouter();

  const {
    removeFromWishlist,
    count,
  } = useWishlistManager();

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleAddToCart = async (product: DisplayProduct) => {
    try {
      const firstVariant = product.variants?.[0];
      if (!firstVariant?._id) {
        console.error("No variant available for product:", product.name);
        return;
      }

      await addToCart({
        productId: product._id,
        variantId: firstVariant._id,
        quantity: 1,
      }).unwrap();

      console.log("✅ Added to cart:", product.name);
    } catch (error) {
      console.error("❌ Failed to add to cart:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
        <div className="text-center bg-[var(--color-card)] p-6 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-[var(--color-accent)] mx-auto"></div>
          <p className="mt-3 text-[var(--color-foreground)] font-medium text-sm">
            Loading your wishlist...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
        <div className="text-center bg-[var(--color-card)] p-6 rounded-xl shadow-lg">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-[var(--text-error)] font-semibold text-sm mb-3">
            Failed to load wishlist
          </p>
          <Button onClick={() => window.location.reload()} className="text-sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!wishlistProducts.length) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
        <div className="text-center bg-[var(--color-card)] p-6 rounded-xl shadow-lg max-w-sm">
          <div className="text-6xl mb-4">💝</div>
          <h2 className="text-xl font-bold mb-3 text-[var(--color-foreground)]">
            Your wishlist is empty
          </h2>
          <p className="text-[var(--text-accent)] mb-4 text-sm">
            Add some furniture to your wishlist!
          </p>
          <Button onClick={() => router.push("/products")} className="w-full py-3">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Compact Header */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
                My Wishlist
              </h1>
              <span className="bg-[var(--color-secondary)] text-[var(--text-accent)] px-2 py-1 rounded text-xs font-medium border border-[var(--color-border-custom)]">
                {count}
              </span>
            </div>

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

        {/* Grid Layout for Multiple Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
          {wishlistProducts.map((product: DisplayProduct) => (
            <WishlistItem
              key={product._id}
              product={product}
              onRemove={() => handleRemove(product._id)}
              onAddToCart={() => handleAddToCart(product)}
              isAdding={isAdding}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;

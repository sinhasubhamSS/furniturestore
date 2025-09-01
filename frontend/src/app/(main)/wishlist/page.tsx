"use client";

import WishlistItem from "@/components/wishlist/wishlishtComponent";
import { useGetWishlistWithProductsQuery } from "@/redux/services/user/wishlistApi";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { useWishlistManager } from "@/hooks/useWishlistManger"; // ✅ Add custom hook
import { DisplayProduct } from "@/types/Product";

const WishlistPage = () => {
  const {
    data: wishlistProducts = [],
    isLoading,
    isError,
  } = useGetWishlistWithProductsQuery();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  // ✅ Use Redux-powered wishlist manager
  const {
    removeFromWishlist,
    count,
  } = useWishlistManager();

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId); // ✅ Now uses Redux with optimistic updates
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
      <div className="text-center mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading your wishlist...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center mt-10">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg">Failed to load wishlist</p>
      </div>
    );
  }

  if (!wishlistProducts.length) {
    return (
      <div className="text-center mt-16">
        <div className="text-6xl mb-6">💝</div>
        <h2 className="text-3xl font-bold mb-4">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6">
          Add some products to your wishlist!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {/* ✅ Real-time count from Redux */}
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {count} items
        </span>
      </div>

      <div className="space-y-6">
        {wishlistProducts.map((product: DisplayProduct) => (
          <WishlistItem
            key={product._id}
            product={product}
            onRemove={() => handleRemove(product._id)}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;

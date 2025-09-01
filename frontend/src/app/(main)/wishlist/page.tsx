"use client";

import WishlistItem from "@/components/wishlist/wishlishtComponent";
import {
  useGetWishlistWithProductsQuery,
  useRemoveFromWishlistMutation,
} from "@/redux/services/user/wishlistApi";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { DisplayProduct } from "@/types/Product";

const WishlistPage = () => {
  const { data: wishlistProducts = [], isLoading, isError } =
    useGetWishlistWithProductsQuery();

  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist({ productId }).unwrap();
    } catch (error) {
      console.error("❌ Failed to remove from wishlist:", error);
    }
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
        quantity: 1
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
        <p className="text-gray-600 mb-6">Add some products to your wishlist!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      <p className="text-gray-600 mb-6">{wishlistProducts.length} items saved</p>

      <div className="space-y-6">
        {wishlistProducts.map((product: DisplayProduct) => ( // ✅ Explicit typing
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

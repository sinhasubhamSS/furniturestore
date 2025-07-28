"use client";

import WishlistItem from "@/components/wishlist/wishlishtComponent";
import {
  useGetWishlistWithProductsQuery,
  useRemoveFromWishlistMutation,
} from "@/redux/services/user/wishlistApi";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";

const WishlistPage = () => {
  const { data: wishlist = [], isLoading, isError } =
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

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart({ productId, quantity: 1 }).unwrap();
    } catch (error) {
      console.error("❌ Failed to add to cart:", error);
    }
  };

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (isError)
    return (
      <p className="text-center mt-10 text-red-600">
        Failed to load wishlist 😓
      </p>
    );
  if (!wishlist.length)
    return <p className="text-center mt-10">Your wishlist is empty 😔</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      <div className="space-y-4">
        {wishlist.map((product) => (
          <WishlistItem
            key={product._id}
            product={product}
            onRemove={() => handleRemove(product._id)}
            onAddToCart={() => handleAddToCart(product._id)}
           
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;

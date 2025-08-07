// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Product } from "@/types/Product";
// import { FiHeart } from "react-icons/fi";
// import { AiFillHeart } from "react-icons/ai";
// import {
//   useAddToWishlistMutation,
//   useRemoveFromWishlistMutation,
//   useWishlistidsQuery,
// } from "@/redux/services/user/wishlistApi";

// type Props = {
//   product: Product;
//   variant?: "default" | "trending";
// };

// const ProductCard = ({ product, variant = "default" }: Props) => {
//   const router = useRouter();
//   const { _id, title, name, price, images, slug, category } = product;

//   const productName = title || name;

//   const { data: wishlistIds = [], isLoading: isLoadingWishlist } =
//     useWishlistidsQuery();

//   const [localWishlisted, setLocalWishlisted] = useState<boolean | null>(null);

//   const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();
//   const [removeFromWishlist, { isLoading: isRemoving }] =
//     useRemoveFromWishlistMutation();

//   const isMutating = isAdding || isRemoving;

//   const isWishlisted =
//     localWishlisted !== null ? localWishlisted : wishlistIds.includes(_id);

//   useEffect(() => {
//     setLocalWishlisted(null);
//   }, [wishlistIds, _id]);

//   const handleWishlistClick = async (e: React.MouseEvent) => {
//     e.stopPropagation();

//     if (isLoadingWishlist || isMutating) return;

//     const newState = !isWishlisted;
//     setLocalWishlisted(newState);

//     try {
//       if (newState) {
//         await addToWishlist({ productId: _id });
//       } else {
//         await removeFromWishlist({ productId: _id });
//       }
//       setLocalWishlisted(null);
//     } catch (error) {
//       setLocalWishlisted(isWishlisted);
//       console.error("❌ Wishlist toggle failed:", error);
//     }
//   };

//   const handleProductClick = () => {
//     router.push(`/products/${slug}`);
//   };

//   const getImageUrl = (): string => {
//     if (images && images.length > 0) {
//       return images[0].url;
//     }
//     return "/images/placeholder.jpg";
//   };

//   // Enhanced Trending variant
//   if (variant === "trending") {
//     return (
//       <div
//         onClick={handleProductClick}
//         className="relative cursor-pointer bg-gradient-to-b from-white to-gray-50/50 h-full w-full flex flex-col border border-[var(--color-secondary)]/15 rounded-lg hover:shadow-lg hover:border-[var(--color-secondary)]/30 transition-all duration-300 group overflow-hidden"
//       >
//         {/* Premium Badge */}
//         <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/80 text-white text-xs px-2 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           Trending
//         </div>

//         {/* Enhanced Wishlist Button */}
//         <button
//           onClick={handleWishlistClick}
//           disabled={isLoadingWishlist || isMutating}
//           className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
//             isWishlisted 
//               ? "bg-red-50 border-red-200 text-red-500 shadow-md" 
//               : "bg-white/90 border-gray-200/50 text-gray-500 hover:bg-red-50 hover:text-red-500"
//           } ${isMutating ? "animate-pulse" : ""}`}
//           aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//         >
//           {isMutating ? (
//             <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
//           ) : isWishlisted ? (
//             <AiFillHeart className="w-3 h-3" />
//           ) : (
//             <FiHeart className="w-3 h-3" />
//           )}
//         </button>

//         {/* Enhanced Product Image */}
//         <div className="flex-1 p-3 flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-transparent">
//           <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
//             <img
//               src={getImageUrl()}
//               alt={productName}
//               loading="lazy"
//               className="w-full h-full object-contain max-h-20 drop-shadow-sm"
//               onError={(e) => {
//                 e.currentTarget.src = "/images/placeholder.jpg";
//               }}
//             />
//           </div>
//         </div>

//         {/* Enhanced Product Info */}
//         <div className="p-3 pt-1 flex-shrink-0 space-y-1.5 bg-gradient-to-t from-white to-transparent">
//           <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors duration-200">
//             {productName}
//           </h3>
//           <div className="flex items-center justify-between">
//             <p className="text-sm font-bold text-[var(--color-accent)]">
//               ₹{price.toLocaleString()}
//             </p>
//             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Enhanced Default variant
//   return (
//     <div
//       onClick={handleProductClick}
//       className="relative cursor-pointer bg-gradient-to-b from-white to-gray-50/30 p-4 rounded-xl border border-[var(--color-secondary)]/10 shadow-sm hover:shadow-xl hover:border-[var(--color-secondary)]/25 transition-all duration-300 h-full flex flex-col group"
//     >
//       {/* Enhanced Wishlist Button */}
//       <button
//         onClick={handleWishlistClick}
//         disabled={isLoadingWishlist || isMutating}
//         className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
//           isWishlisted 
//             ? "bg-red-50 border-red-200 text-red-500 shadow-md" 
//             : "bg-white/90 border-gray-200/50 text-gray-500 hover:bg-red-50 hover:text-red-500"
//         } ${isMutating ? "animate-pulse" : ""}`}
//         aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//       >
//         {isMutating ? (
//           <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
//         ) : isWishlisted ? (
//           <AiFillHeart className="w-4 h-4" />
//         ) : (
//           <FiHeart className="w-4 h-4" />
//         )}
//       </button>

//       {/* Enhanced Product Image */}
//       <div className="w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50 group-hover:shadow-inner transition-all duration-300">
//         <img
//           src={getImageUrl()}
//           alt={productName}
//           loading="lazy"
//           className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
//           onError={(e) => {
//             e.currentTarget.src = "/images/placeholder.jpg";
//           }}
//         />
//       </div>

//       {/* Enhanced Product Info */}
//       <div className="space-y-2 flex-1 flex flex-col">
//         <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-5 group-hover:text-[var(--color-accent)] transition-colors duration-200">
//           {productName}
//         </h3>
//         <div className="flex items-center justify-between mt-auto">
//           <p className="text-lg font-bold text-[var(--color-accent)]">
//             ₹{price.toLocaleString()}
//           </p>
//           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//         </div>
//         <div className="flex items-center justify-between">
//           <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
//             {category.name}
//           </p>
//           <span className="text-xs text-green-600 font-medium">In Stock</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;

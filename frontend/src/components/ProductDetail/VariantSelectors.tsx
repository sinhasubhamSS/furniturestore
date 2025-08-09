// "use client";

// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState, AppDispatch } from "@/redux/store";
// import {
//   setSelectedColor,
//   setSelectedSize,
//   setQuantity,
// } from "@/redux/slices/ProductDetailSlice"; // Adjust slice name if needed

// const VariantSelectors = ({ product }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { selectedColor, selectedSize, quantity, selectedVariant } =
//     useSelector((state: RootState) => state.productDetail);

//   // Unique colors and sizes calculation
//   const colors = [
//     ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
//   ] as string[];
//   const sizes = [
//     ...new Set(
//       (selectedColor
//         ? product.variants
//             .filter((v) => v.color === selectedColor)
//             .map((v) => v.size)
//         : product.variants.map((v) => v.size)
//       ).filter(Boolean)
//     ),
//   ] as string[];

//   return (
//     <div className="py-6 space-y-6">
//       {/* Color Selector */}
//       {colors.length > 0 && (
//         <div>
//           <h3 className="text-lg font-medium text-gray-900 mb-3">Color</h3>
//           <div className="flex flex-wrap gap-3">
//             {colors.map((color, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => dispatch(setSelectedColor(color))}
//                 className={`px-4 py-2 rounded-full border transition-all ${
//                   selectedColor === color
//                     ? "bg-[--color-accent]/10 border-[--color-accent] font-medium"
//                     : "border-gray-300 hover:bg-gray-100"
//                 }`}
//               >
//                 {color}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Size Selector */}
//       {sizes.length > 0 && (
//         <div>
//           <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
//           <div className="flex flex-wrap gap-3">
//             {sizes.map((size, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => dispatch(setSelectedSize(size))}
//                 className={`w-14 h-14 flex items-center justify-center rounded-lg border transition-all ${
//                   selectedSize === size
//                     ? "bg-[--color-accent] text-white border-[--color-accent]"
//                     : "border-gray-300 hover:bg-gray-100"
//                 }`}
//               >
//                 {size}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Quantity Selector */}
//       <div className="flex items-center">
//         <h3 className="text-lg font-medium text-gray-900 mr-4">Quantity</h3>
//         <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
//           <button
//             className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
//             onClick={() => dispatch(setQuantity(Math.max(1, quantity - 1)))}
//             disabled={quantity <= 1}
//           >
//             -
//           </button>
//           <span className="px-4 py-2 bg-gray-50">{quantity}</span>
//           <button
//             className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
//             onClick={() => dispatch(setQuantity(quantity + 1))}
//             disabled={quantity >= (selectedVariant?.stock || 1)}
//           >
//             +
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VariantSelectors;

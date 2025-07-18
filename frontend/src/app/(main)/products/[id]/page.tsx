// 'use client';

// import React, { useState, useEffect } from "react";

// import { useParams } from "next/navigation";
// import { useGetProductBySlugQuery } from "@/redux/services/user/publicProductApi";

// const ProductDetailPage = () => {
//   const { slug } = useParams();
//   const { data: product, isLoading, error } = useGetProductBySlugQuery(slug as string);

//   const [selectedImg, setSelectedImg] = useState("");

//   useEffect(() => {
//     if (product?.images?.length > 0) {
//       setSelectedImg(product.images[0].url);
//     }
//   }, [product]);

//   if (isLoading) return <div className="p-6 text-center">Loading...</div>;
//   if (error || !product) return <div className="p-6 text-center text-red-600">Product not found.</div>;

//   const savedAmount = (product.originalPrice || 0) - product.price;

//   return (
//     <div className="w-full max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
//       {/* LEFT: Images */}
//       <div className="flex gap-4">
//         {/* Thumbnails */}
//         <div className="flex flex-col gap-2">
//           {product.images.map((img, idx) => (
//             <img
//               key={idx}
//               src={img.url}
//               onClick={() => setSelectedImg(img.url)}
//               className={`w-16 h-16 object-cover rounded-md cursor-pointer border transition-all duration-200 ${
//                 selectedImg === img.url
//                   ? "border-2 border-blue-600"
//                   : "border border-gray-300"
//               }`}
//               alt={`thumb-${idx}`}
//             />
//           ))}
//         </div>

//         {/* Main Image */}
//         <div className="flex-1 aspect-square bg-white rounded-lg overflow-hidden relative group">
//           <img
//             src={selectedImg}
//             alt="main product"
//             className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
//           />
//         </div>
//       </div>

//       {/* RIGHT: Info */}
//       <div>
//         <h1 className="text-2xl font-semibold mb-2 text-gray-800">{product.name}</h1>
//         <p className="text-sm text-gray-600 mb-2">
//           {product.rating || 4.1}★ ({product.reviews || 10} Reviews)
//         </p>

//         {/* Price */}
//         <div className="flex items-center gap-2 text-xl font-bold text-green-700 mt-2">
//           ₹{product.price.toLocaleString()}
//           {product.originalPrice && (
//             <>
//               <span className="line-through text-base text-gray-500">
//                 ₹{product.originalPrice.toLocaleString()}
//               </span>
//               <span className="text-red-500 text-sm">
//                 {Math.floor(
//                   ((product.originalPrice - product.price) / product.originalPrice) * 100
//                 )}
//                 % off
//               </span>
//             </>
//           )}
//         </div>
//         {product.originalPrice && (
//           <p className="text-sm text-gray-600 mb-2">
//             You save ₹{savedAmount.toLocaleString()}
//           </p>
//         )}

//         {/* Stock + Delivery */}
//         <p
//           className={`text-sm mt-2 font-medium ${
//             product.inStock ? "text-green-700" : "text-red-500"
//           }`}
//         >
//           {product.inStock ? "In Stock" : "Out of Stock"}
//         </p>
//         <p className="text-sm text-gray-600">{product.deliveryText || "Delivery in 5-7 days"}</p>

//         {/* Description */}
//         <p className="text-gray-700 mt-4">{product.description}</p>

//         {/* Buttons */}
//         <div className="flex flex-wrap gap-4 my-5">
//           <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded shadow">
//             Buy Now
//           </button>
//           <button className="border border-blue-600 text-blue-600 py-2 px-6 rounded hover:bg-blue-50 shadow">
//             Add to Cart
//           </button>
//         </div>

//         {/* Highlights */}
//         {product.highlights?.length > 0 && (
//           <div className="mt-6">
//             <h2 className="font-semibold text-lg mb-2 text-gray-800">Highlights</h2>
//             <ul className="list-disc ml-6 text-gray-700 space-y-1 text-sm">
//               {product.highlights.map((point: string, idx: number) => (
//                 <li key={idx}>{point}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductDetailPage;

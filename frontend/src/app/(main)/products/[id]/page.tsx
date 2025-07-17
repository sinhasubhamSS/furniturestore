// app/products/[id]/page.tsx
'use client';
import React, { useState } from "react";

const dummyProduct = {
  id: "1",
  title: "Meera Handicraft Sheesham Wood Bed",
  price: 30453,
  originalPrice: 54888,
  discount: "44% off",
  rating: 4.1,
  reviews: 46,
  images: [
    "/images/bed1.jpg",
    "/images/bed2.jpg",
    "/images/bed3.jpg",
    "/images/bed4.jpg"
  ],
  description:
    "A beautiful sheesham wood bed For Bed Room /Guest Room /Hotel. Solid Wood Queen Box Bed.",
  highlights: [
    "Bed Material Subtype: Rosewood (Sheesham)",
    "Storage Type: Box",
    "Delivery Condition: DIY",
    "W x H x D: 157.48 cm x 114.3 cm x 210.82 cm"
  ],
  inStock: true,
  deliveryText: "Delivery by Tue, 23 Jul | Free",
};

const ProductDetailPage = () => {
  const [selectedImg, setSelectedImg] = useState(dummyProduct.images[0]);

  const savedAmount =
    dummyProduct.originalPrice - dummyProduct.price;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* LEFT: Images */}
      <div className="flex gap-4">
        {/* Thumbnails */}
        <div className="flex flex-col gap-2">
          {dummyProduct.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              onClick={() => setSelectedImg(img)}
              className={`w-16 h-16 object-cover rounded-md cursor-pointer border transition-all duration-200 ${
                selectedImg === img
                  ? "border-2 border-blue-600"
                  : "border border-gray-300"
              }`}
              alt={`thumb-${idx}`}
            />
          ))}
        </div>

        {/* Main Image */}
        <div className="flex-1 aspect-square bg-white rounded-lg overflow-hidden relative group">
          <img
            src={selectedImg}
            alt="main product"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* RIGHT: Info */}
      <div>
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">{dummyProduct.title}</h1>
        <p className="text-sm text-gray-600 mb-2">
          {dummyProduct.rating}★ ({dummyProduct.reviews} Reviews)
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 text-xl font-bold text-green-700 mt-2">
          ₹{dummyProduct.price.toLocaleString()}
          <span className="line-through text-base text-gray-500">
            ₹{dummyProduct.originalPrice.toLocaleString()}
          </span>
          <span className="text-red-500 text-sm">{dummyProduct.discount}</span>
        </div>
        <p className="text-sm text-gray-600 mb-2">You save ₹{savedAmount.toLocaleString()}</p>

        {/* Stock + Delivery */}
        <p className={`text-sm mt-2 font-medium ${
          dummyProduct.inStock ? "text-green-700" : "text-red-500"
        }`}>
          {dummyProduct.inStock ? "In Stock" : "Out of Stock"}
        </p>
        <p className="text-sm text-gray-600">{dummyProduct.deliveryText}</p>

        {/* Description */}
        <p className="text-gray-700 mt-4">{dummyProduct.description}</p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 my-5">
          <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded shadow">
            Buy Now
          </button>
          <button className="border border-blue-600 text-blue-600 py-2 px-6 rounded hover:bg-blue-50 shadow">
            Add to Cart
          </button>
        </div>

        {/* Highlights */}
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2 text-gray-800">Highlights</h2>
          <ul className="list-disc ml-6 text-gray-700 space-y-1 text-sm">
            {dummyProduct.highlights.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

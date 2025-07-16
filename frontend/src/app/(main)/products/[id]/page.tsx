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
  ]
};

const ProductDetailPage = () => {
  const [selectedImg, setSelectedImg] = useState(dummyProduct.images[0]);

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* LEFT: Images like Flipkart */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          {dummyProduct.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              onClick={() => setSelectedImg(img)}
              className={`w-16 h-16 object-cover border rounded-md cursor-pointer ${
                selectedImg === img ? "border-blue-600" : ""
              }`}
              alt={`thumb-${idx}`}
            />
          ))}
        </div>

        <div className="flex-1 aspect-square bg-white rounded-lg overflow-hidden">
          <img
            src={selectedImg}
            alt="main product"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* RIGHT: Product Info */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">{dummyProduct.title}</h1>
        <p className="text-sm text-gray-500 mb-2">
          {dummyProduct.rating}★ | {dummyProduct.reviews} Ratings & Reviews
        </p>
        <div className="flex items-baseline gap-2 text-xl font-bold text-green-700">
          ₹{dummyProduct.price}
          <span className="line-through text-gray-500 text-base">
            ₹{dummyProduct.originalPrice}
          </span>
          <span className="text-red-500 text-sm">{dummyProduct.discount}</span>
        </div>

        <p className="text-gray-700 mt-4 mb-2">{dummyProduct.description}</p>

        <div className="flex gap-4 my-4">
          <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded">
            Buy Now
          </button>
          <button className="border border-blue-600 text-blue-600 py-2 px-6 rounded hover:bg-blue-50">
            Add to Cart
          </button>
        </div>

        {/* Highlights */}
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Highlights</h2>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
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

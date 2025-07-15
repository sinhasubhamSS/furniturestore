// app/products/[id]/page.tsx
import React from "react";

const dummyProduct = {
  id: "1",
  title: "Red Nike Shoes",
  price: 2999,
  description: "Comfortable and stylish Nike running shoes.",
  images: ["/images/shoe1.jpg", "/images/shoe2.jpg", "/images/shoe3.jpg"],
};

const ProductDetailPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Images */}
      <div className="flex flex-col gap-4">
        <div className="w-full aspect-square bg-white rounded-lg overflow-hidden">
          <img
            src={dummyProduct.images[0]}
            alt={dummyProduct.title}
            className="w-full h-full object-contain"
          />
        </div>
        {/* thumbnails */}
        <div className="flex gap-2">
          {dummyProduct.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="thumb"
              className="w-20 h-20 object-contain border rounded-md cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* Details */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">{dummyProduct.title}</h1>
        <p className="text-lg font-bold text-green-600 mb-4">
          ₹{dummyProduct.price}
        </p>
        <p className="text-gray-700 mb-4">{dummyProduct.description}</p>

        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;

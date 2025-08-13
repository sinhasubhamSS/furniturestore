"use client";

import React from "react";
import { DisplayProduct } from "@/types/Product"; // Assuming your types
import { FaShippingFast, FaShieldAlt } from "react-icons/fa";

type Props = {
  product: DisplayProduct;
};

const ProductInfo: React.FC<Props> = ({ product }) => {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Information</h2> {/* Updated heading for clarity */}
      <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Specifications</h3>
          {product.specifications.map((section, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="text-lg font-medium text-gray-800 mb-2">{section.section}</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.specs.map((spec, i) => (
                  <li key={i} className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600">{spec.key}</span>
                    <span className="text-gray-900 font-medium">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Measurements */}
      {product.measurements && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Measurements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.measurements.width && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Width</p>
                <p className="font-medium">{product.measurements.width} cm</p>
              </div>
            )}
            {product.measurements.height && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Height</p>
                <p className="font-medium">{product.measurements.height} cm</p>
              </div>
            )}
            {product.measurements.depth && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Depth</p>
                <p className="font-medium">{product.measurements.depth} cm</p>
              </div>
            )}
            {product.measurements.weight && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Weight</p>
                <p className="font-medium">{product.measurements.weight} kg</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warranty & Disclaimer */}
      <div className="space-y-4 mb-6">
        {product.warranty && (
          <div>
            <h4 className="font-medium text-gray-900">Warranty</h4>
            <p className="text-gray-600">{product.warranty}</p>
          </div>
        )}
        {product.disclaimer && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm italic">{product.disclaimer}</p>
          </div>
        )}
      </div>

      {/* Merged Additional Information (as sub-section) */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping & Policies</h3> {/* Optional: More specific sub-heading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <FaShippingFast className="text-xl text-[--color-accent]" />
            <div>
              <h4 className="font-medium">Free Shipping</h4>
              <p className="text-sm text-gray-500">All over India</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-xl text-[--color-accent]" />
            <div>
              <h4 className="font-medium">Secure Payment</h4>
              <p className="text-sm text-gray-500">100% Protected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[--color-accent] w-6 h-6 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">7</span>
            </div>
            <div>
              <h4 className="font-medium">Easy Returns</h4>
              <p className="text-sm text-gray-500">7 Days Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;

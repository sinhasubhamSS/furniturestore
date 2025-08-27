"use client";

import React, { useEffect, useState } from "react";
import { useGetProductBySlugQuery } from "@/redux/services/user/publicProductApi";
import { useDispatch, useSelector } from "react-redux"; // ✅ Add useSelector
import { AppDispatch, RootState } from "@/redux/store"; // ✅ Add RootState
import {
  setQuantity,
  resetProductState,
} from "@/redux/slices/ProductDetailSlice";

import ImageGallery from "./ImageGallery";
import VariantSelector from "./VariantSelector";
import ProductHeader from "./ProductHeader";
import ProductPrice from "./ProductPrice";
import QuantitySelector from "./QuantitySelector";
import StockStatus from "./StockStatus";
import ActionButtons from "./ActionButtons";
import ProductInfo from "./ProductInfo";
import ReviewsSection from "../reviews/ReviewSection";
import PincodeChecker from "./PincodeChecker";

interface Props {
  slug: string;
}

const ProductDetail = ({ slug }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug);

  // ✅ Direct Redux selector for user
  const user = useSelector((state: RootState) => state.user.activeUser);

  useEffect(() => {
    if (product) {
      dispatch(setQuantity(1));
      console.log("Transformed Product Data:", product);
    }
  }, [product, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex flex-col space-y-4 w-full max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="bg-gray-200 rounded-lg w-full md:w-1/2 h-[400px]"></div>
            <div className="w-full md:w-1/2 space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-destructive text-lg">Failed to load product.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-2 md:px-4 py-6">
      {/* Product Details Section */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        {/* Left Column - Image + Buttons */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2 lg:gap-3">
          <ImageGallery />
          <div className="ml-0 lg:ml-[72px] max-w-full lg:max-w-[480px] w-full">
            <ActionButtons productId={product._id} />
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <ProductHeader product={product} />
            <ProductPrice variants={product.variants} />
            <div className="py-4 space-y-4">
              <VariantSelector variants={product.variants} />
              <QuantitySelector />
            </div>
            <StockStatus />
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                📍 Check Delivery Availability
              </h3>
              <PincodeChecker />
            </div>
          </div>
          <ProductInfo product={product} />
        </div>
      </div>

      {/* ✅ Reviews Section with Direct Redux User */}
      <ReviewsSection
        productId={product._id}
        currentUserId={user?._id || "guest"} // ✅ Direct selector usage
      />
    </div>
  );
};

export default ProductDetail;

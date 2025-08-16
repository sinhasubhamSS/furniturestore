"use client";

import React, { useEffect } from "react";
import { useGetProductBySlugQuery } from "@/redux/services/user/publicProductApi";
import { useDispatch } from "react-redux";
import {  AppDispatch } from "@/redux/store";
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

interface Props {
  slug: string;
}

const ProductDetail = ({ slug }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug);

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
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4"> {/* Responsive gap: small on mobile, minimal on desktop */}
        {/* Left Column - Image + Buttons */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2 lg:gap-3"> {/* Internal spacing between image and buttons */}
          <ImageGallery />
          {/* Action Buttons - Aligned with image container start */}
          <div className="ml-0 lg:ml-[72px] max-w-full lg:max-w-[480px] w-full"> {/* Responsive margin: no margin on mobile, aligned on desktop */}
            <ActionButtons productId={product._id} />
          </div>
        </div>
        
        {/* Right Column - Product Info */}
        <div className="w-full lg:w-1/2 mt-4 lg:mt-0"> {/* Add margin-top on mobile, remove on desktop */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <ProductHeader product={product} />
            <ProductPrice  variants={product.variants} />
            <div className="py-4 space-y-4">
              <VariantSelector variants={product.variants} />
              <QuantitySelector />
            </div>
            <StockStatus />
          </div>
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

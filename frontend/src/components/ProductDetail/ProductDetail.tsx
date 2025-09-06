"use client";

import React, { useEffect } from "react";
import { useGetProductBySlugQuery } from "@/redux/services/user/publicProductApi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
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
  const user = useSelector((state: RootState) => state.user.activeUser);

  useEffect(() => {
    if (product) {
      dispatch(setQuantity(1));
    }
  }, [product, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-[var(--color-primary)] flex items-center justify-center">
        <div className="text-center bg-[var(--color-card)] p-6 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-[var(--color-accent)] mx-auto"></div>
          <p className="mt-3 text-[var(--color-foreground)] font-medium text-sm">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-screen min-h-screen bg-[var(--color-primary)] flex items-center justify-center">
        <div className="text-center bg-[var(--color-card)] p-6 rounded-xl shadow-lg">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-[var(--text-error)] font-semibold text-sm">
            Failed to load product
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Container - Navbar से 8px gap, sides में कोई gap नहीं */}
      <div className="w-full min-h-screen bg-[var(--color-primary)] pt-8 px-0">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column - Images & Buttons */}
          <div className="pl-0 pr-4  lg:pl-0 lg:pr-6 ">
            {/* Image Gallery with Frame */}
            <div className="w-full mb-1">
              <ImageGallery />
            </div>

            {/* Action Buttons in Frame */}
            <div className="w-full">
              <div className="relative p-2 lg:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 shadow-xl">
                <div className="absolute inset-3 border-2 border-gray-300 rounded-xl opacity-20 pointer-events-none"></div>
                <div className="relative z-10">
                  <ActionButtons productId={product._id} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="pl-0 pr-4 lg:pl-0 lg:pr-6  bg-[var(--color-card)] ">
            <div className="space-y-2">
              <ProductHeader product={product} />
              <ProductPrice variants={product.variants} />

              <div className="space-y-4">
                <VariantSelector variants={product.variants} />
                <QuantitySelector />
              </div>

              <StockStatus />

              <div className="pt-6 border-t border-[var(--color-border-custom)]">
                <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-3">
                  📍 Check Delivery
                </h3>
                <PincodeChecker />
              </div>
            </div>
          </div>
        </div>

        {/* Product Information & Reviews */}
        <div className="p-4 lg:p-6 space-y-6">
          <ProductInfo product={product} />
          <ReviewsSection
            productId={product._id}
            currentUserId={user?._id || "guest"}
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetail;

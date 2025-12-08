// components/ProductDetail/ProductDetail.tsx
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
import ReviewsSection from "../../components/reviews/ReviewSection";
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
      <div className="w-full min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4">
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
      <div className="w-full min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4">
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
    <div className="w-full min-h-screen bg-[var(--color-primary)] pt-8">
      {/* Main Product Section - 40/60 split on large screens */}
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-[40%]">
            <div className="mb-4">
              <ImageGallery />
            </div>
            <div className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 shadow-xl">
              <div className="absolute inset-3 border-2 border-gray-300 rounded-xl opacity-20 pointer-events-none"></div>
              <div className="relative z-10">
                <ActionButtons productId={product._id} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-[60%] bg-[var(--color-card)] rounded-xl p-2 lg:p- shadow-sm">
            <div className="space-y-2">
              <ProductHeader product={product} />
              <ProductPrice variants={product.variants} />

              <div className="space-y-2">
                <VariantSelector variants={product.variants} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <QuantitySelector />
                <StockStatus />
              </div>

              <div className="pt-2 border-t border-[var(--color-border-custom)]">
                <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-1">
                  📍 Check Delivery
                </h3>
                <PincodeChecker />
              </div>
            </div>
          </div>
        </div>

        {/* Product Information & Reviews - Full width below */}
        <div className="mt-8 space-y-6">
          <ProductInfo product={product} />
          <ReviewsSection
            productId={product._id}
            currentUserId={user?._id} // pass undefined if guest; ReviewCard checks owner
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

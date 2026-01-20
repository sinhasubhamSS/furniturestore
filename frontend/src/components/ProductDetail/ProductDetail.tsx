// components/ProductDetail/ProductDetailClient.tsx
"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  setQuantity,
  resetProductState,
  setSelectedVariant,
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
import MobileStickyCTA from "./MobileStickyCTA";

import { DisplayProduct } from "@/types/Product";

interface Props {
  product: DisplayProduct;
}

const ProductDetailClient: React.FC<Props> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.activeUser);

  /**
   * ✅ IMPORTANT FIX
   * Product load hote hi default variant select karo
   */
  useEffect(() => {
    if (!product?.variants?.length) return;

    const defaultVariant =
      product.variants.find((v) => v._id === product.primaryVariantId) ||
      product.variants[0];

    dispatch(setSelectedVariant(defaultVariant));
    dispatch(setQuantity(1));
  }, [product, dispatch]);

  /**
   * ✅ Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch]);

  return (
    <>
      <div className="w-full min-h-screen bg-[var(--color-primary)] pt-8 pb-24 lg:pb-0">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left */}
            <div className="w-full lg:w-[40%]">
              <ImageGallery />
              <div className="mt-4 hidden lg:block">
                <ActionButtons productId={product._id} />
              </div>
            </div>

            {/* Right */}
            <div className="w-full lg:w-[60%] bg-[var(--color-card)] rounded-xl p-4">
              <ProductHeader product={product} />
              <ProductPrice />
              <VariantSelector variants={product.variants} />

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <QuantitySelector />
                <StockStatus />
              </div>

              <div className="mt-4">
                <PincodeChecker />
              </div>
            </div>
          </div>

          {/* Info + Reviews */}
          <div className="mt-8 space-y-6">
            <ProductInfo product={product} />
            <ReviewsSection productId={product._id} currentUserId={user?._id} />
          </div>
        </div>
      </div>

      {/* 🔥 MOBILE STICKY CTA */}
      <MobileStickyCTA productId={product._id} />
    </>
  );
};

export default ProductDetailClient;

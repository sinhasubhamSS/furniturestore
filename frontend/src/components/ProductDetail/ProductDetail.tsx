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

  /* ================= DEFAULT VARIANT ================= */
  useEffect(() => {
    if (!product?.variants?.length) return;

    const defaultVariant =
      product.variants.find((v) => v._id === product.primaryVariantId) ||
      product.variants[0];

    dispatch(setSelectedVariant(defaultVariant));
    dispatch(setQuantity(1));
  }, [product, dispatch]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch]);

  return (
    <>
      {/* ================= PDP ROOT ================= */}
      <div className="w-full bg-[var(--color-primary)] pt-6 pb-16">
        {/* Wider container like Flipkart */}
        <div className="max-w-[1440px] mx-auto px-3 lg:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 lg:gap-6">
            {/* ================= LEFT: IMAGE (STICKY) ================= */}
            <div>
              <div className="lg:sticky lg:top-24">
                <ImageGallery />
              </div>
            </div>

            {/* ================= RIGHT: DETAILS (NORMAL FLOW) ================= */}
            <div className="bg-[var(--color-card)] rounded-md p-4 md:p-5">
              <ProductHeader product={product} />
              <ProductPrice />

              {/* CTA – IMPORTANT (Flipkart style: close to price) */}
              <div className="mt-4">
                <ActionButtons productId={product._id} />
              </div>

              <div className="mt-5">
                <VariantSelector variants={product.variants} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <QuantitySelector />
                <StockStatus />
              </div>

              <div className="mt-5">
                <PincodeChecker />
              </div>

              {/* PRODUCT INFO */}
              <div className="mt-10 border-t pt-8">
                <ProductInfo product={product} />
              </div>

              {/* REVIEWS */}
              <div className="mt-12 border-t pt-8">
                <ReviewsSection
                  productId={product._id}
                  currentUserId={user?._id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE STICKY CTA ================= */}
      <MobileStickyCTA productId={product._id} />
    </>
  );
};

export default ProductDetailClient;

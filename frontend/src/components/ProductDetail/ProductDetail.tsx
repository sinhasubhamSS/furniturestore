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
      <div className="w-full bg-[var(--color-primary)] pt-3 pb-16">
        <div className="max-w-[1440px] mx-auto px-3 lg:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-2 lg:gap-3">
            {/* ================= LEFT: IMAGE + CTA (STICKY) ================= */}
            <div>
              <div className="lg:sticky lg:top-24 space-y-2">
                <ImageGallery />


                <div className="hidden lg:block">
                  <ActionButtons productId={product._id} />
                </div>
              </div>
            </div>

            {/* ================= RIGHT: DETAILS ================= */}
            <div className="bg-[var(--color-card)] border border-black/5 rounded-md p-4 md:p-5">
              {/* TITLE */}
              <ProductHeader product={product} />

              {/* PRICE */}
              <ProductPrice />

              {/* DIVIDER */}
              <div className="my-6 h-px bg-black/10" />

              {/* VARIANTS */}
              <VariantSelector variants={product.variants} />

              {/* QTY + STOCK */}
              <div className="flex flex-wrap items-center gap-4 mt-5">
                <QuantitySelector />
                <StockStatus />
              </div>

              {/* PINCODE */}
              <div className="mt-5">
                <PincodeChecker />
              </div>

              {/* DIVIDER */}
              <div className="my-8 h-px bg-black/10" />

              {/* PRODUCT INFO */}
              <ProductInfo product={product} />

              {/* DIVIDER */}
              <div className="my-8 h-px bg-black/10" />

              {/* REVIEWS */}
              <ReviewsSection
                productId={product._id}
                currentUserId={user?._id}
              />
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

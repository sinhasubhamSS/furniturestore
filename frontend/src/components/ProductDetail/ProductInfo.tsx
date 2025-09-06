"use client";

import React from "react";
import { DisplayProduct } from "@/types/Product";

type Props = {
  product: DisplayProduct;
};

const ProductInfo: React.FC<Props> = ({ product }) => {
  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow-lg border border-[var(--color-border-custom)] p-4">
      <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-3">
        Product Details
      </h2>
      <p className="text-[var(--color-foreground)] mb-4 leading-relaxed text-sm">
        {product.description}
      </p>

      {/* Specifications - Compact Grid */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-3">
            Specifications
          </h3>
          {product.specifications.map((section, idx) => (
            <div key={idx} className="mb-3">
              <h4 className="text-base font-medium text-[var(--text-accent)] mb-2">
                {section.section}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {section.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-[var(--color-border-custom)] pb-1"
                  >
                    <span className="text-[var(--text-accent)] text-sm">
                      {spec.key}
                    </span>
                    <span className="text-[var(--color-foreground)] font-medium text-sm">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Measurements - Compact Cards */}
      {product.measurements && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-3">
            Measurements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {product.measurements.width && (
              <div className="bg-[var(--color-secondary)] p-3 rounded-lg border border-[var(--color-border-custom)]">
                <p className="text-[var(--text-accent)] text-xs">Width</p>
                <p className="font-semibold text-[var(--color-foreground)]">
                  {product.measurements.width} cm
                </p>
              </div>
            )}
            {product.measurements.height && (
              <div className="bg-[var(--color-secondary)] p-3 rounded-lg border border-[var(--color-border-custom)]">
                <p className="text-[var(--text-accent)] text-xs">Height</p>
                <p className="font-semibold text-[var(--color-foreground)]">
                  {product.measurements.height} cm
                </p>
              </div>
            )}
            {product.measurements.depth && (
              <div className="bg-[var(--color-secondary)] p-3 rounded-lg border border-[var(--color-border-custom)]">
                <p className="text-[var(--text-accent)] text-xs">Depth</p>
                <p className="font-semibold text-[var(--color-foreground)]">
                  {product.measurements.depth} cm
                </p>
              </div>
            )}
            {product.measurements.weight && (
              <div className="bg-[var(--color-secondary)] p-3 rounded-lg border border-[var(--color-border-custom)]">
                <p className="text-[var(--text-accent)] text-xs">Weight</p>
                <p className="font-semibold text-[var(--color-foreground)]">
                  {product.measurements.weight} kg
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warranty & Policies - Inline */}
      <div className="pt-4 border-t border-[var(--color-border-custom)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚚</span>
            <div>
              <p className="font-medium text-[var(--color-foreground)]">
                Free Shipping
              </p>
              <p className="text-[var(--text-accent)] text-xs">
                All over India
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <div>
              <p className="font-medium text-[var(--color-foreground)]">
                Secure Payment
              </p>
              <p className="text-[var(--text-accent)] text-xs">
                100% Protected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">↩️</span>
            <div>
              <p className="font-medium text-[var(--color-foreground)]">
                Easy Returns
              </p>
              <p className="text-[var(--text-accent)] text-xs">7 Days Policy</p>
            </div>
          </div>
        </div>

        {product.warranty && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border-custom)]">
            <p className="text-[var(--text-accent)] text-sm">
              <strong>Warranty:</strong> {product.warranty}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;

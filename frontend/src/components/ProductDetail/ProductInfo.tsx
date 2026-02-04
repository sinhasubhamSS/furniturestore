"use client";

import React from "react";
import { DisplayProduct } from "@/types/Product";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Link from "next/link";

type Props = {
  product: DisplayProduct;
};

const ProductInfo: React.FC<Props> = ({ product }) => {
  const selectedVariant = useSelector(
    (state: RootState) => state.productDetail.selectedVariant,
  );

  const specifications = product.specifications ?? [];
  const measurements = selectedVariant?.measurements;

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border-custom)] rounded-2xl p-6 md:p-8 space-y-12 shadow-sm">
      {/* ================= DESCRIPTION ================= */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">
          Product Details
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
          {product.description}
        </p>
      </section>

      {/* ================= SPECIFICATIONS ================= */}
      {specifications.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
            Specifications
          </h3>

          <div className="space-y-8">
            {specifications.map((section, idx) => (
              <div key={idx}>
                {/* Section title */}
                <h4 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
                  {section.section}
                </h4>

                {/* Table */}
                <div className="border border-[var(--color-border-custom)] rounded-lg overflow-hidden">
                  {section.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="flex border-b last:border-b-0 border-[var(--color-border-custom)]"
                    >
                      {/* LEFT (Key) */}
                      <div className="w-[45%] bg-[var(--color-secondary)] px-4 py-3 text-sm text-[var(--text-accent)]">
                        {spec.key}
                      </div>

                      {/* RIGHT (Value) */}
                      <div className="w-[55%] px-4 py-3 text-sm text-[var(--color-foreground)] font-medium">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= MEASUREMENTS ================= */}
      {measurements && (
        <section>
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-5">
            Measurements
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {measurements.width && (
              <MeasurementCard
                label="Width"
                value={`${measurements.width} cm`}
              />
            )}
            {measurements.height && (
              <MeasurementCard
                label="Height"
                value={`${measurements.height} cm`}
              />
            )}
            {measurements.depth && (
              <MeasurementCard
                label="Depth"
                value={`${measurements.depth} cm`}
              />
            )}
            {measurements.weight && (
              <MeasurementCard
                label="Weight"
                value={`${measurements.weight} kg`}
              />
            )}
          </div>
        </section>
      )}

      {/* ================= WARRANTY & POLICIES ================= */}
      <section className="border-t border-[var(--color-border-custom)] pt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
          <Policy icon="🚚" title="Free Shipping" subtitle="Across India" />
          <Policy icon="🔒" title="Secure Payment" subtitle="100% Protected" />
          <Policy icon="↩️" title="Easy Returns" subtitle="7 Days Policy" />
        </div>

        {product.warrantyPeriod && (
          <div className="pt-4 border-t border-[var(--color-border-custom)]">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              🛠️ {product.warrantyPeriod} Months Warranty
            </p>
            <p className="text-xs text-[var(--text-accent)] mt-1 leading-relaxed">
              Covers manufacturing defects under normal household use.
            </p>

            <Link
              href="/warranty"
              className="inline-block mt-3 text-xs font-medium text-blue-600 hover:underline"
            >
              View full warranty terms →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const MeasurementCard = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="bg-[var(--color-secondary)] p-4 rounded-xl border border-[var(--color-border-custom)]">
    <p className="text-xs text-[var(--text-accent)] mb-1">{label}</p>
    <p className="font-semibold text-[var(--color-foreground)]">{value}</p>
  </div>
);

const Policy = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="text-xl">{icon}</span>
    <div>
      <p className="text-sm font-medium text-[var(--color-foreground)]">
        {title}
      </p>
      <p className="text-xs text-[var(--text-accent)]">{subtitle}</p>
    </div>
  </div>
);

export default ProductInfo;

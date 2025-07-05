import ProductHeader from "@/components/admin/ProductHeader";
import ProductTable from "@/components/admin/ProductTable";
import React from "react";

function page() {
  return (
    <div className="min-h-screen px-6 py-8 bg-[var(--secondary-light)] text-[var(--foreground)]">
      {/* Header */}
      <ProductHeader />

      {/* Product Table Placeholder */}
      <div className="mt-6">
        <ProductTable />
      </div>
    </div>
  );
}

export default page;

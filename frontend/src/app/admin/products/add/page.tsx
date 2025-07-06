"use client";

import React from "react";
import CreateProduct from "@/components/admin/CreateProduct";

const AddProductPage = () => {
  return (
    <div className="min-h-screen px-6 py-8 bg-[var(--secondary-light)] text-[var(--foreground)]">
      <h1 className="text-2xl font-semibold mb-6 text-[var(--text-accent)]">
        Add New Product
      </h1>
      <CreateProduct />
    </div>
  );
};

export default AddProductPage;

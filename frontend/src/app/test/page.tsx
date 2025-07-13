// app/test/page.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Toggle from "@/components/helperComponents/Toogle";
import ProductCard from "@/components/ui/ProductCard";

const TestInputPage = () => {
  const [value, setValue] = useState("");

  return (
    <>
      <Toggle />
      <div className="min-h-screen bg-[var(--background)] p-6 flex justify-center items-center">
        <ProductCard
          id={"123"}
          title="Modern Wooden Chair"
          price={3499}
          images={[
            "/SUVIDHA.png",
            "/images/chair-2.jpg",
            "/images/chair-3.jpg",
          ]}
        />
      </div>
    </>
  );
};

export default TestInputPage;

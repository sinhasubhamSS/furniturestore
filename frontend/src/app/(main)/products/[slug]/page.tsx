"use client";
import ProductDetail from "@/components/ProductDetail";
import { use } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductSlugPage({ params }: PageProps) {
  const { slug } = use(params); // 👈 required in future Next.js versions
  return <ProductDetail slug={slug} />;
}

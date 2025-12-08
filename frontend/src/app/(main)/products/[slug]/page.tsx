"use client";
import ProductDetail from "@/components/ProductDetail/ProductDetail";
import { use } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductSlugPage({ params }: PageProps) {
  const { slug } = use(params); 
  return <ProductDetail slug={slug} />;
}

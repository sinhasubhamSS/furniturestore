"use client";

import { useParams } from "next/navigation";
import { useGetAdminProductsQuery } from "@/redux/services/adminProductapi";
import ProductForm from "@/components/admin/ProductForm";

import type { CreateProductInput } from "@/lib/validations/product.schema";
import axiosClient from "../../../../../../utils/axios";
import { Product } from "@/types/Product";

const EditProductPage = () => {
  const { id } = useParams(); // id will be string

  // ✅ Get product list from cache
  const { data: productList, isLoading } = useGetAdminProductsQuery({
    page: 1,
    limit: 10,
  });

  // ✅ Find the required product
  const product = productList?.products?.find((p: Product) => p._id === id);

 const handleUpdate = async (data: CreateProductInput) => {
  console.log("📦 handleUpdate triggered with:", data); // ✅ this should show up
  try {
    const res = await axiosClient.put(`/products/admin/update/${id}`, data);
    console.log("✅ Update success:", res.data);
  } catch (err: any) {
    console.error("❌ Update failed:", err?.response?.data || err.message);
    throw err;
  }
};



  if (isLoading) return <p className="p-4">Loading...</p>;
  if (!product) return <p className="p-4 text-red-500">Product not found</p>;

  return (
    <ProductForm
      onSubmit={handleUpdate}
      isEdit
      defaultValues={{
        ...product,
        category: product.category._id, // 👈 yahi expected hai form ke schema ke according
      }}
    />
  );
};

export default EditProductPage;

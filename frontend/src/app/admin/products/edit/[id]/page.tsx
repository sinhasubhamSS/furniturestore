"use client";

import { useParams } from "next/navigation";

import ProductForm from "@/components/admin/ProductForm";

import type { CreateProductInput } from "@/lib/validations/product.schema";
import { Product } from "@/types/Product";
import toast from "react-hot-toast";
import {
  useEditProductMutation,
  useGetAdminProductsQuery,
} from "@/redux/services/admin/adminProductapi";

const EditProductPage = () => {
  const { id } = useParams(); // id is a string
  console.log(id);
  if (!id) return <p className="p-4 text-red-500">Invalid product ID</p>;

  const { data: productList, isLoading } = useGetAdminProductsQuery({
    page: 1,
    limit: 10,
  });

  const [editProduct, { isLoading: isUpdating }] = useEditProductMutation();

  const product = productList?.products?.find((p: Product) => p._id === id);

  const handleUpdate = async (data: CreateProductInput) => {
    try {
      await editProduct({ id: id as string, data }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update product");
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
        category: product.category._id, // Form schema expects category id
      }}
      loading={isUpdating}
    />
  );
};

export default EditProductPage;

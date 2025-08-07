"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import ProductForm from "@/components/admin/product/ProductForm";
import { useCreateProductMutation } from "@/redux/services/admin/adminProductapi";
import { CreateProductInput } from "@/lib/validations/product.schema";

const AddProductPage = () => {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleCreate = async (data: CreateProductInput) => {
    try {
      await createProduct(data).unwrap();
      router.push("/admin/products");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create product");
    }
  };

  return <ProductForm onSubmit={handleCreate} />;
};

export default AddProductPage;

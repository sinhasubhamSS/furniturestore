"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProductForm from "@/components/admin/product/ProductForm";
import { useCreateProductMutation } from "@/redux/services/admin/adminProductapi";
import type { CreateProductInput } from "@/lib/validations/product.schema";

const AddProductPage = () => {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleCreate = async (data: CreateProductInput) => {
    if (!data) {
      toast.error("Invalid product data");
      return;
    }

    try {
      // check mutation signature: if your RTK expects raw data, pass `data`
      // if it expects wrapper { data }, change to: await createProduct({ data }).unwrap();
      await createProduct(data).unwrap();
 

      toast.success("Product created");
      router.push("/admin/products");
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to create product");
    }
  };

  return <ProductForm onSubmit={handleCreate} loading={isLoading} />;
};

export default AddProductPage;

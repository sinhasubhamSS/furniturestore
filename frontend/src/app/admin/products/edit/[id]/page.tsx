"use client";

import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/product/ProductForm";
import type { CreateProductInput } from "@/lib/validations/product.schema";
import toast from "react-hot-toast";
import {
  useEditProductMutation,
  useGetAdminProductsQuery,
} from "@/redux/services/admin/adminProductapi";

const EditProductPage = () => {
  const { id } = useParams();

  if (!id) return <p className="p-4 text-red-500">Invalid product ID</p>;
  if (Array.isArray(id))
    return <p className="p-4 text-red-500">Invalid product ID (multiple values)</p>;

  const { data: productList, isLoading } = useGetAdminProductsQuery({
    page: 1,
    limit: 10,
  });

  const [editProduct, { isLoading: isUpdating }] = useEditProductMutation();

  const product = productList?.products?.find((p) => p._id === id);

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (!product) return <p className="p-4 text-red-500">Product not found</p>;

  // Explicitly exclude slug when destructuring
  // Use type assertion since slug exists in product but not in CreateProductInput
  const { category, slug, ...restProduct } = product as {
    slug: string;
    category: { _id: string };
    [key: string]: any;
  };

  // Build default values without slug for the form
  const transformedProduct: Partial<CreateProductInput> = {
    ...restProduct,
    category: category._id,
    variants: product.variants.map((v) => ({
      color: v.color,
      size: v.size,
      basePrice: (v as unknown as { basePrice?: number }).basePrice ?? 0,
      gstRate: v.gstRate,
      stock: v.stock,
      hasDiscount: v.hasDiscount,
      discountPercent: v.discountPercent,
      discountValidUntil: v.discountValidUntil ?? "",
      discountedPrice:
        (v as unknown as { discountedPrice?: number }).discountedPrice ?? 0,
      images: v.images,
    })),
  };

  const handleUpdate = async (data: CreateProductInput) => {
    try {
      console.log("Submitting product update:", data);

      // No slug removal needed here because form data never has slug
      await editProduct({ id, data }).unwrap();

      toast.success("Product updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update product");
    }
  };

  return (
    <ProductForm
      onSubmit={handleUpdate}
      isEdit
      defaultValues={transformedProduct}
      loading={isUpdating}
    />
  );
};

export default EditProductPage;

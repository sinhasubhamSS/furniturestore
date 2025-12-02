"use client";

import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/product/ProductForm";
import type { CreateProductInput } from "@/lib/validations/product.schema";
import toast from "react-hot-toast";
import {
  useEditProductMutation,
  useGetAdminProductsQuery,
} from "@/redux/services/admin/adminProductapi";
import type { Variant, VariantImage } from "@/types/Product";

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
    category: { _id: string } | string;
    [key: string]: any;
  };

  // Helper to normalize discountValidUntil to string | undefined
  const normalizeDiscountValidUntil = (d?: string | Date): string | undefined => {
    if (!d) return undefined;
    if (typeof d === "string") {
      if (d.trim() === "") return undefined;
      return d;
    }
    if (d instanceof Date) return d.toISOString();
    // fallback
    try {
      const s = String(d);
      return s.trim() === "" ? undefined : s;
    } catch {
      return undefined;
    }
  };

  // Build default values without slug for the form
  const transformedProduct: Partial<CreateProductInput> = {
    ...restProduct,
    category: typeof category === "string" ? category : category._id,
    variants: (product.variants ?? []).map((v: Variant) => ({
      color: v.color,
      size: v.size,
      basePrice: v.basePrice ?? 0,
      gstRate: v.gstRate ?? 0,
      stock: v.stock ?? 0,
      hasDiscount: !!v.hasDiscount,
      discountPercent: v.discountPercent ?? 0,
      discountValidUntil: normalizeDiscountValidUntil(v.discountValidUntil),
      discountedPrice: v.discountedPrice ?? 0,
      images: (v.images ?? []).map((img: VariantImage) => ({
        url: img.url,
        public_id: img.public_id,
        thumbSafe: img.thumbSafe,
        isPrimary: img.isPrimary,
      })),
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

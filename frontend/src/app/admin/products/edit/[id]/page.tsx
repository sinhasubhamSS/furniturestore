"use client";

import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/product/ProductForm";
import type { CreateProductInput } from "@/lib/validations/product.schema";
import toast from "react-hot-toast";
import {
  useEditProductMutation,
  useGetAdminProductByIdQuery,
} from "@/redux/services/admin/adminProductapi";
import type { Variant, VariantImage, DisplayProduct } from "@/types/Product";

const EditProductPage = () => {
  const { id } = useParams();

  if (!id || Array.isArray(id)) {
    return <p className="p-4 text-red-500">Invalid product ID</p>;
  }

  // ✅ CORRECT: fetch single product by ID
  const { data: product, isLoading } = useGetAdminProductByIdQuery(id);

  const [editProduct, { isLoading: isUpdating }] = useEditProductMutation();

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (!product) return <p className="p-4 text-red-500">Product not found</p>;

  // Remove slug (not part of CreateProductInput)
  const { category, slug, ...restProduct } = product as DisplayProduct & {
    slug: string;
  };

  const normalizeDiscountValidUntil = (
    d?: string | Date,
  ): string | undefined => {
    if (!d) return undefined;
    if (typeof d === "string") return d || undefined;
    return d instanceof Date ? d.toISOString() : undefined;
  };

  const transformedProduct: Partial<CreateProductInput> = {
  ...restProduct,
  category: typeof category === "string" ? category : category?._id,

  variants: (product.variants ?? []).map((v: Variant) => ({
    attributes: {
      finish: v.attributes?.finish ?? "",
      size: v.attributes?.size ?? "",
      seating: v.attributes?.seating ?? "",
      configuration: v.attributes?.configuration ?? "",
    },

    basePrice: v.basePrice ?? 0,
    gstRate: v.gstRate ?? 0,
    listingPrice: v.listingPrice,
    sellingPrice: v.sellingPrice,

    stock: v.stock ?? 0,

    hasDiscount: !!v.hasDiscount,
    discountPercent: v.discountPercent ?? 0,
    discountValidUntil: normalizeDiscountValidUntil(v.discountValidUntil),

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

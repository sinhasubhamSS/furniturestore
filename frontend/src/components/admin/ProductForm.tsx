"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ImageUploader";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  createProductSchema,
  CreateProductInput,
} from "@/lib/validations/product.schema";
import { useGetCategoriesQuery } from "@/redux/services/adminCategoryapi";

interface ProductFormProps {
  onSubmit: (data: CreateProductInput) => Promise<void>;
  defaultValues?: Partial<CreateProductInput>;
  isEdit?: boolean;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  defaultValues,
  isEdit = false,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      isPublished: true,
      ...defaultValues,
    },
  });

  const { data: categories = [], isLoading: loadingCategories } =
    useGetCategoriesQuery();

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        title: defaultValues.title ?? "",
        description: defaultValues.description ?? "",
        gstRate: defaultValues.gstRate ?? 0,
        basePrice: defaultValues.basePrice ?? 0,
        stock: defaultValues.stock ?? 1,
        images: defaultValues.images ?? [],
        category: defaultValues.category ?? "",
        isPublished: defaultValues.isPublished ?? true,
      });
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(
        isEdit ? "Product updated successfully" : "Product created successfully"
      );
      if (!isEdit) reset();
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-semibold text-center mb-6">
        {isEdit ? "Update Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <Input
          label="Name"
          placeholder="Product name"
          name="name"
          register={register("name")}
          error={errors.name?.message}
        />
        <Input
          label="Title"
          placeholder="Short title"
          name="title"
          register={register("title")}
          error={errors.title?.message}
        />
        <Input
          label="Description"
          placeholder="Describe the product"
          name="description"
          register={register("description")}
          error={errors.description?.message}
        />
        <Input
          type="number"
          label="GST Rate (%)"
          placeholder="e.g. 18"
          name="gstRate"
          register={register("gstRate", { valueAsNumber: true })}
          error={errors.gstRate?.message}
        />
        <Input
          type="number"
          label="Price (₹)"
          placeholder="Base price of product"
          name="basePrice"
          register={register("basePrice", { valueAsNumber: true })}
          error={errors.basePrice?.message}
        />
        <Input
          type="number"
          label="Stock"
          placeholder="Available stock"
          name="stock"
          register={register("stock", { valueAsNumber: true })}
          error={errors.stock?.message}
        />

        {/* Category Dropdown */}
        <div className="space-y-2">
          <label className="block font-medium">Category</label>
          <select
            {...register("category", { required: true })}
            className="w-full border p-2 rounded-md"
            disabled={loadingCategories}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        {/* Image Upload */}
        <ImageUploader
          maxFiles={5}
          folder="products"
          onUpload={(urls) => {
            setValue("images", urls, { shouldValidate: true });
          }}
          defaultUrls={defaultValues?.images || []}
        />
        {errors.images?.message && (
          <p className="text-sm text-red-500">{errors.images.message}</p>
        )}

        {/* Visibility */}
        <div className="space-y-2">
          <label className="block font-medium">Visibility</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={watch("isPublished") === true}
                onChange={() => setValue("isPublished", true)}
              />
              Public
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={watch("isPublished") === false}
                onChange={() => setValue("isPublished", false)}
              />
              Private
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Processing..."
              : isEdit
              ? "Update Product"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

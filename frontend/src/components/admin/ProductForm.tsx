"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ImageUploader";
import toast from "react-hot-toast";
import {
  createProductSchema,
  CreateProductInput,
} from "@/lib/validations/product.schema";

interface ProductFormProps {
  onSubmit: (data: CreateProductInput) => Promise<void>;
  defaultValues?: Partial<CreateProductInput>;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  defaultValues,
  isEdit = false,
}) => {
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
      name: defaultValues?.name || "",
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      gstRate: defaultValues?.gstRate || 0,
      basePrice: defaultValues?.basePrice || 0,
      stock: defaultValues?.stock || 1,
      images: defaultValues?.images || [],
      category: defaultValues?.category || "",
      isPublished: defaultValues?.isPublished ?? true,
    },
  });

  const handleFormSubmit = async (data: CreateProductInput) => {
    try {
      await onSubmit(data);
      toast.success(
        isEdit ? "Product updated successfully" : "Product created successfully"
      );
      if (!isEdit) reset(); // Only reset if creating
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
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
        <Input
          label="Category ID"
          placeholder="Paste category ID"
          name="category"
          register={register("category", {
            setValueAs: (value) => value.trim(),
          })}
          error={errors.category?.message}
        />

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

        {/* Visibility Toggle */}
        <div className="space-y-2">
          <label className="block font-medium">Visibility</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register("isPublished")}
                onChange={() => setValue("isPublished", true)}
                checked={true === watch("isPublished")}
              />
              Public
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register("isPublished")}
                onChange={() => setValue("isPublished", false)}
                checked={false === watch("isPublished")}
              />
              Private
            </label>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

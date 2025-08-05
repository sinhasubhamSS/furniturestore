"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import VariantsField from "./VariantsField";
import SpecificationsField from "./SpecificationsField";
import VisibilityToggle from "./VisibilityToggle";

import {
  createProductSchema,
  CreateProductInput,
} from "@/lib/validations/product.schema";
import { useGetCategoriesQuery } from "@/redux/services/admin/adminCategoryapi";
import ImageUploader from "@/components/helperComponents/ImageUploader";

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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colors, setColors] = useState<string[]>(
    defaultValues?.variants?.color || [""]
  );
  const [sizes, setSizes] = useState<string[]>(
    defaultValues?.variants?.size || [""]
  );
  const [specs, setSpecs] = useState(
    defaultValues?.specifications || [{ key: "", value: "" }]
  );

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
      reset({ ...defaultValues });
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    try {
      const finalData: CreateProductInput = {
        ...data,
        variants: { color: colors, size: sizes },
        specifications: specs,
      };

      await onSubmit(finalData);
      toast.success(isEdit ? "Product updated" : "Product created");
      if (!isEdit) reset();
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isEdit ? "Edit Product" : "Create Product"}
      </h1>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Input
          label="Name"
          name="name"
          placeholder="Product name"
          register={register("name")}
          error={errors.name?.message}
        />
        <Input
          label="Title"
          name="title"
          placeholder="Short title"
          register={register("title")}
          error={errors.title?.message}
        />
        <Input
          label="Description"
          name="description"
          placeholder="Product description"
          register={register("description")}
          error={errors.description?.message}
        />
        <Input
          type="number"
          label="Price (₹)"
          name="basePrice"
          placeholder="Base price"
          register={register("basePrice", { valueAsNumber: true })}
          error={errors.basePrice?.message}
        />
        <Input
          type="number"
          label="GST Rate (%)"
          name="gstRate"
          placeholder="e.g. 18"
          register={register("gstRate", { valueAsNumber: true })}
          error={errors.gstRate?.message}
        />
        <Input
          type="number"
          label="Stock"
          name="stock"
          placeholder="Quantity in stock"
          register={register("stock", { valueAsNumber: true })}
          error={errors.stock?.message}
        />

        {/* Category Select */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            {...register("category")}
            className="w-full border p-2 rounded"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category?.message && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>

        {/* Images */}
        <ImageUploader
          maxFiles={5}
          folder="products"
          onUpload={(urls) =>
            setValue("images", urls, { shouldValidate: true })
          }
          defaultUrls={defaultValues?.images || []}
        />

        {/* Variants */}
        <VariantsField label="Colors" values={colors} onChange={setColors} />
        <VariantsField label="Sizes" values={sizes} onChange={setSizes} />

        {/* Specifications */}
        <SpecificationsField specs={specs} onChange={setSpecs} />

        {/* Visibility */}
        <VisibilityToggle
          value={watch("isPublished") ?? false}
          onChange={(val) => setValue("isPublished", val)}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? "Submitting..."
            : isEdit
            ? "Update Product"
            : "Create Product"}
        </Button>
      </form>
    </div>
  );
};

export default ProductForm;

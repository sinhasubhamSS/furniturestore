// components/admin/product/ProductForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import VisibilityToggle from "./VisibilityToggle";
import VariantForm from "./VariantsField";
import SpecificationForm from "./SpecificationsField";
import CategoryDropdown from "./CategoryDropdown";
import type { CreateProductInput } from "@/lib/validations/product.schema";

type ProductFormProps = {
  onSubmit: (data: CreateProductInput) => void;
  isEdit?: boolean;
  defaultValues?: Partial<CreateProductInput>;
  loading?: boolean;
};

const defaultVariant: CreateProductInput["variants"][number] = {
  color: "",
  size: "",
  images: [],
  basePrice: 0,
  gstRate: 0,
  stock: 0,
  hasDiscount: false,
  discountPercent: 0,
  discountValidUntil: "",
  discountedPrice: 0,
};

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  isEdit = false,
  defaultValues,
  loading = false,
}) => {
  const [visibility, setVisibility] = useState(
    defaultValues?.isPublished ?? true
  );

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    defaultValues: {
      variants: [defaultVariant],
      specifications: [],
      measurements: {},
      isPublished: true,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({ ...defaultValues });
      setVisibility(defaultValues.isPublished ?? true);
    }
  }, [defaultValues, reset]);

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const handleFormSubmit = (data: CreateProductInput) => {
    // normalize empty strings for discountValidUntil -> undefined (backend treats missing as permanent)
    data.variants = data.variants.map((v) => ({
      ...v,
      discountValidUntil: v.discountValidUntil
        ? v.discountValidUntil
        : undefined,
    }));
    data.isPublished = visibility;
    onSubmit(data);
  };

  const handleSpecificationChange = (
    specs: CreateProductInput["specifications"]
  ) => {
    setValue("specifications", specs);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>

      {/* Product Name */}
      <Input
        id="name"
        label="Product Name"
        placeholder="e.g. Leather Wallet"
        required
        {...register("name", { required: "Product name is required" })}
        error={errors.name?.message as string | undefined}
      />

      {/* Title */}
      <Input
        id="title"
        label="Title"
        placeholder="Optional product title"
        {...register("title")}
        error={errors.title?.message as string | undefined}
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          {...register("description", { required: "Description is required" })}
          className="w-full p-2 rounded-md border border-gray-300"
          placeholder="Enter product description"
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <CategoryDropdown
        value={getValues("category") ?? ""}
        onChange={(value: string) => setValue("category", value)}
      />

      {/* Visibility */}
      <VisibilityToggle value={visibility} onChange={setVisibility} />

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Variants</h3>
          <Button type="button" onClick={() => appendVariant(defaultVariant)}>
            + Add Variant
          </Button>
        </div>

        {variantFields.map((field, index) => (
          <VariantForm
            key={field.id}
            index={index}
            register={register}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
            remove={() => removeVariant(index)}
          />
        ))}
      </div>

      {/* Specifications */}
      <SpecificationForm onChange={handleSpecificationChange} />

      {/* Measurements */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Measurements</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="measurements.width"
            label="Width (cm)"
            type="number"
            step="0.01"
            {...register("measurements.width", { valueAsNumber: true })}
          />
          <Input
            id="measurements.height"
            label="Height (cm)"
            type="number"
            step="0.01"
            {...register("measurements.height", { valueAsNumber: true })}
          />
          <Input
            id="measurements.depth"
            label="Depth (cm)"
            type="number"
            step="0.01"
            {...register("measurements.depth", { valueAsNumber: true })}
          />
          <Input
            id="measurements.weight"
            label="Weight (kg)"
            type="number"
            step="0.01"
            {...register("measurements.weight", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Warranty & Disclaimer */}
      <Input
        id="warranty"
        label="Warranty Info"
        placeholder="e.g. 1-year warranty included"
        {...register("warranty")}
      />

      <Input
        id="disclaimer"
        label="Disclaimer"
        placeholder="Any important disclaimers"
        {...register("disclaimer")}
      />

      <Button type="submit" className="w-full mt-6" disabled={loading}>
        {isEdit ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
};

export default ProductForm;

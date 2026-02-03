"use client";

import React, { useEffect, useMemo, useState } from "react";
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

/* ---------------- DEFAULT VARIANT ---------------- */
const defaultVariant = {
  attributes: {
    finish: "",
    size: "",
    seating: "",
    configuration: "",
  },
  images: [],
  basePrice: 0,
  gstRate: 0,
  stock: 0,
  hasDiscount: false,
  discountPercent: 0,
  discountValidUntil: "",
  listingPrice: undefined,
};

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  isEdit = false,
  defaultValues,
  loading = false,
}) => {
  const [visibility, setVisibility] = useState(
    defaultValues?.isPublished ?? true,
  );

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid },
    trigger,
    setError,
    clearErrors,
  } = useForm<CreateProductInput>({
    mode: "onChange",
    defaultValues: {
      variants: [defaultVariant],
      specifications: [],
      isPublished: true,
      ...defaultValues,
    },
  });

  /* ---------- register controlled fields ---------- */
  useEffect(() => {
    register("category", { required: "Category is required" });

    register("specifications", {
      validate: (val) => {
        if (!val || (Array.isArray(val) && val.length === 0)) return true;
        if (!Array.isArray(val)) return "Invalid specifications format";

        for (const sec of val) {
          if (!sec.section?.trim()) return "Section name is required";
          if (!Array.isArray(sec.specs) || sec.specs.length === 0)
            return "At least one spec is required";

          for (const s of sec.specs) {
            if (!s.key?.trim()) return "Spec key is required";
            if (!s.value?.trim()) return "Spec value is required";
          }
        }
        return true;
      },
    });
  }, [register]);

  useEffect(() => {
    if (defaultValues) {
      reset({ ...defaultValues });
      setVisibility(defaultValues.isPublished ?? true);
    }
  }, [defaultValues, reset]);

  /* ---------- Variants ---------- */
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const onSpecsChange = (specs: any[]) => {
    setValue("specifications", specs, {
      shouldValidate: true,
      shouldDirty: true,
    });
    trigger("specifications");
  };

  const round2 = (n: number) => Math.round(Number(n || 0) * 100) / 100;

  /* ---------- SUBMIT ---------- */
  const handleFormSubmit = (rawData: CreateProductInput) => {
    const data = JSON.parse(JSON.stringify(rawData)) as CreateProductInput;

    data.variants = (data.variants || []).map((v) => ({
      ...v,
      basePrice: round2(Number(v.basePrice || 0)),
      listingPrice:
        v.listingPrice !== undefined && v.listingPrice !== null
          ? round2(Number(v.listingPrice))
          : undefined,
      gstRate: Number(v.gstRate || 0),
      stock: Number(v.stock || 0),
      discountValidUntil: v.discountValidUntil || undefined,
    }));

    data.isPublished = visibility;
    onSubmit(data);
  };

  /* ---------- VALIDATION HELPERS ---------- */
  const watchedVariants = watch("variants");
  const watchedCategory = watch("category");
  const watchedSpecs = watch("specifications");

  const variantsHaveUploadedImage = (variants: any[] | undefined) => {
    if (!Array.isArray(variants) || variants.length === 0) return false;

    return variants.every((v) => {
      const finishOk =
        v?.attributes?.finish && String(v.attributes.finish).trim().length > 0;

      const basePriceOk = typeof v?.basePrice === "number" && v.basePrice > 0;

      const images = Array.isArray(v?.images) ? v.images : [];
      const anyUploaded = images.some(
        (img: any) =>
          typeof img?.public_id === "string" && img.public_id.length > 0,
      );

      return finishOk && basePriceOk && anyUploaded;
    });
  };

  useEffect(() => {
    if (!watchedCategory) {
      setError("category", {
        type: "required",
        message: "Category is required",
      });
    } else {
      clearErrors("category");
    }
  }, [watchedCategory, setError, clearErrors]);

  useEffect(() => {
    trigger("specifications");
  }, [watchedSpecs, trigger]);

  const canSubmit =
    isValid && variantsHaveUploadedImage(watchedVariants) && !!watchedCategory;

  const disabledMessage = useMemo(() => {
    if (!watchedCategory) return "Category is required";
    if (!isValid) return "Fill required product fields";
    if (!variantsHaveUploadedImage(watchedVariants))
      return "Each variant needs finish, base price (>0) and at least one image";
    return "";
  }, [isValid, watchedVariants, watchedCategory]);

  /* ---------- UI ---------- */
  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold">
        {isEdit ? "Edit Product" : "Create Product"}
      </h2>

      <Input
        label="Product Name"
        required
        {...register("name", { required: "Product name is required" })}
        error={errors.name?.message as string}
      />

      <Input label="Title" {...register("title")} />

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register("description", { required: "Description is required" })}
          className="w-full p-2 rounded-md border"
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <CategoryDropdown
        value={getValues("category") ?? ""}
        onChange={(v) =>
          setValue("category", v, { shouldDirty: true, shouldValidate: true })
        }
      />

      <VisibilityToggle value={visibility} onChange={setVisibility} />

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Variants</h3>
          <Button type="button" onClick={() => append(defaultVariant)}>
            + Add Variant
          </Button>
        </div>

        {fields.map((f, i) => (
          <VariantForm
            key={f.id}
            index={i}
            register={register}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
            remove={() => remove(i)}
            errors={errors}
          />
        ))}
      </div>

      <SpecificationForm onChange={onSpecsChange} />
      <Input
        label="Warranty Period (Months)"
        type="number"
        placeholder="12 / 24 / 36"
        {...register("warrantyPeriod", {
          required: "Warranty period is required",
          valueAsNumber: true,
          min: { value: 1, message: "Minimum 1 month" },
        })}
        error={errors.warrantyPeriod?.message as string}
      />

      {canSubmit ? (
        <Button type="submit" disabled={loading} className="w-full">
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      ) : (
        <p className="text-sm text-red-500 text-center">{disabledMessage}</p>
      )}
    </form>
  );
};

export default ProductForm;

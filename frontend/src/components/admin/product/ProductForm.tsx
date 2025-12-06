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
  listingPrice: undefined,
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
    formState: { errors, isValid },
    trigger,
    setError,
    clearErrors,
  } = useForm<CreateProductInput>({
    mode: "onChange",
    defaultValues: {
      variants: [defaultVariant],
      specifications: [],
      measurements: {},
      isPublished: true,
      ...defaultValues,
    },
  });

  // register category (since CategoryDropdown is controlled)
  useEffect(() => {
    register("category", { required: "Category is required" });
    // register specifications validator (we set value from SpecificationForm)
    register("specifications", {
      validate: (val) => {
        if (!val || (Array.isArray(val) && val.length === 0)) return true;
        if (!Array.isArray(val)) return "Invalid specifications format";
        for (let i = 0; i < val.length; i++) {
          const sec = val[i];
          if (
            !sec ||
            typeof sec.section !== "string" ||
            sec.section.trim().length === 0
          ) {
            return "Section name is required";
          }
          if (!Array.isArray(sec.specs) || sec.specs.length === 0) {
            return "At least one spec is required in each section";
          }
          for (let j = 0; j < sec.specs.length; j++) {
            const s = sec.specs[j];
            if (!s || !s.key || String(s.key).trim().length === 0) {
              return "Spec key is required";
            }
            if (!s || !s.value || String(s.value).trim().length === 0) {
              return "Spec value is required";
            }
          }
        }
        return true;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register]);

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

  // when SpecificationForm changes, put value into RHF (and validate)
  const onSpecsChange = (specs: any[]) => {
    setValue("specifications", specs, {
      shouldValidate: true,
      shouldDirty: true,
    });
    // trigger validation for specs immediately
    trigger("specifications");
  };

  // helper: round to 2 decimals
  const round2 = (n: number) => Math.round(Number(n || 0) * 100) / 100;

  // normalize & sanitize before submit
  const handleFormSubmit = (rawData: CreateProductInput) => {
    const data = JSON.parse(JSON.stringify(rawData)) as CreateProductInput;

    // normalize discountValidUntil & coerce numbers per variant
    data.variants = (data.variants || []).map((v) => {
      const basePrice = round2(Number(v.basePrice || 0));
      const listingPrice =
        typeof v.listingPrice !== "undefined" && v.listingPrice !== null
          ? round2(Number(v.listingPrice))
          : undefined;
      const gstRate = Number(v.gstRate || 0);
      const stock = Number(v.stock || 0);

      return {
        ...v,
        basePrice,
        listingPrice,
        gstRate,
        stock,
        // keep discountValidUntil undefined if empty
        discountValidUntil: v.discountValidUntil
          ? v.discountValidUntil
          : undefined,
      };
    });

    // clean measurements: remove null/empty and coerce to numbers
    if (data.measurements && typeof data.measurements === "object") {
      const m: any = {};
      ["width", "height", "depth", "weight"].forEach((k) => {
        const val = (data.measurements as any)[k];
        if (val === "" || val === null || val === undefined) return;
        const num = Number(val);
        if (!Number.isNaN(num)) m[k] = round2(num);
      });
      if (Object.keys(m).length > 0) data.measurements = m as any;
      else delete (data as any).measurements;
    }

    data.isPublished = visibility;

    onSubmit(data);
  };

  // watch variants to ensure each variant has required fields + uploaded image
  const watchedVariants = watch("variants");
  const watchedCategory = watch("category");
  const watchedSpecs = watch("specifications");

  // helper to check variant-level requirements (size optional)
  const variantsHaveUploadedImage = (variantsParam: any[] | undefined) => {
    if (!Array.isArray(variantsParam) || variantsParam.length === 0)
      return false;

    return variantsParam.every((v) => {
      const colorOk = v?.color && String(v.color).trim().length > 0;
      // size optional now
      const basePriceOk =
        typeof v?.basePrice === "number" &&
        !isNaN(v.basePrice) &&
        v.basePrice > 0;
      const images = Array.isArray(v?.images) ? v.images : [];
      const anyUploaded = images.some(
        (img: any) =>
          typeof img?.public_id === "string" &&
          img.public_id &&
          img.public_id.length > 0
      );
      return colorOk && basePriceOk && anyUploaded;
    });
  };

  // ensure category required error shows if empty after first touch
  useEffect(() => {
    if (!watchedCategory || String(watchedCategory).trim() === "") {
      setError("category", {
        type: "required",
        message: "Category is required",
      });
    } else {
      clearErrors("category");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCategory]);

  // also trigger specs validation live
  useEffect(() => {
    // run validation for specs (registered above)
    trigger("specifications");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSpecs]);

  const canSubmit =
    isValid && variantsHaveUploadedImage(watchedVariants) && !!watchedCategory;

  const disabledMessage = useMemo(() => {
    if (!watchedCategory || String(watchedCategory).trim() === "")
      return "Category is required";
    if (!isValid) return "Fill required fields (name/description/etc.)";
    if (!variantsHaveUploadedImage(watchedVariants))
      return "Each variant needs color, base price (>0) and at least one uploaded image.";
    return "";
  }, [isValid, watchedVariants, watchedCategory]);

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
        onChange={(v: string) => {
          setValue("category", v, { shouldValidate: true, shouldDirty: true });
        }}
      />
      {errors.category && (
        <p className="text-red-500 text-sm">{errors.category.message}</p>
      )}

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
            errors={errors}
          />
        ))}
      </div>

      {/* Specifications */}
      <SpecificationForm onChange={onSpecsChange} />
      {errors.specifications && (
        <p className="text-red-500 text-sm">
          {(errors.specifications as any).message ||
            String(errors.specifications)}
        </p>
      )}

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

      {/* Submit */}
      {canSubmit ? (
        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      ) : (
        <div className="w-full mt-6 text-center text-sm text-gray-500">
          <div className={disabledMessage ? "text-red-500" : ""}>
            {disabledMessage || "Fill all required fields to enable Create"}
          </div>
        </div>
      )}
    </form>
  );
};

export default ProductForm;

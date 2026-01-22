// components/admin/product/VariantsField.tsx
"use client";

import React, { useEffect } from "react";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader, {
  UploadedImage,
} from "@/components/helperComponents/ImageUploader";

interface VariantFormProps {
  index: number;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  watch: UseFormWatch<any>;
  remove: () => void;
  errors?: FieldErrors;
}

const VariantForm: React.FC<VariantFormProps> = ({
  index,
  register,
  setValue,
  getValues,
  watch,
  remove,
  errors,
}) => {
  /* ---------- IMAGE VALIDATION ---------- */
  useEffect(() => {
    register(`variants.${index}.images`, {
      validate: (imgs: any[]) => {
        if (!Array.isArray(imgs) || imgs.length === 0)
          return "At least one image is required";
        const hasUploaded = imgs.some(
          (im) => typeof im?.public_id === "string" && im.public_id.length > 0,
        );
        if (!hasUploaded) return "At least one uploaded image is required";
        return true;
      },
    });
  }, [index, register]);

  const handleImageUpload = (images: UploadedImage[]) => {
    if (images?.length) {
      const primaryIndex = images.findIndex((i) => i.isPrimary);
      images = images.map((img, i) => ({
        ...img,
        isPrimary: primaryIndex === -1 ? i === 0 : i === primaryIndex,
      }));
    }

    setValue(`variants.${index}.images`, images, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const hasDiscount = watch(`variants.${index}.hasDiscount`);
  const imageError =
    (errors?.variants && (errors.variants as any)[index]?.images) || undefined;

  /* ---------- UI ---------- */
  return (
    <div className="border rounded-lg p-4 space-y-5 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Variant {index + 1}</h4>
        <Button
          type="button"
          onClick={remove}
          className="bg-red-500 text-white px-3 py-1 text-sm"
        >
          Remove
        </Button>
      </div>

      {/* Images */}
      <ImageUploader
        folder="variants"
        maxFiles={5}
        onUpload={handleImageUpload}
        defaultUrls={
          (getValues(`variants.${index}.images`) as UploadedImage[]) || []
        }
      />
      {imageError && (
        <p className="text-red-500 text-sm">{imageError.message}</p>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Finish *"
          placeholder="e.g. Walnut / Brown"
          {...register(`variants.${index}.attributes.finish`, {
            required: "Finish is required",
          })}
          error={
            (errors?.variants &&
              (errors.variants as any)[index]?.attributes?.finish?.message) as
              | string
              | undefined
          }
        />

        <Input
          label="Size (optional)"
          placeholder="e.g. King / Medium"
          {...register(`variants.${index}.attributes.size`)}
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Base Price (₹) *"
          type="number"
          step="0.01"
          {...register(`variants.${index}.basePrice`, {
            valueAsNumber: true,
            required: "Base price is required",
            validate: (v) => v > 0 || "Must be greater than 0",
          })}
        />

        <Input
          label="GST Rate (%) *"
          type="number"
          step="0.01"
          {...register(`variants.${index}.gstRate`, {
            valueAsNumber: true,
            required: "GST rate required",
          })}
        />

        <Input
          label="Listing Price (MRP)"
          type="number"
          step="0.01"
          {...register(`variants.${index}.listingPrice`, {
            valueAsNumber: true,
          })}
        />
      </div>

      <Input
        label="Stock"
        type="number"
        {...register(`variants.${index}.stock`, {
          valueAsNumber: true,
        })}
      />

      {/* Discount */}
      <div className="border-t pt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register(`variants.${index}.hasDiscount`)}
          />
          <span className="text-sm font-medium">Enable Discount</span>
        </label>

        {hasDiscount && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <Input
              label="Discount %"
              type="number"
              min={0}
              max={99}
              {...register(`variants.${index}.discountPercent`, {
                valueAsNumber: true,
              })}
            />
            <Input
              label="Valid Until"
              type="date"
              {...register(`variants.${index}.discountValidUntil`)}
            />
          </div>
        )}
      </div>

      {/* Measurements (VARIANT SPECIFIC) */}
      <div className="border-t pt-4">
        <h5 className="font-medium mb-2">Measurements (variant specific)</h5>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Length (cm)"
            type="number"
            step="0.01"
            {...register(`variants.${index}.measurements.length`, {
              valueAsNumber: true,
            })}
          />
          <Input
            label="Width (cm)"
            type="number"
            step="0.01"
            {...register(`variants.${index}.measurements.width`, {
              valueAsNumber: true,
            })}
          />
          <Input
            label="Height (cm)"
            type="number"
            step="0.01"
            {...register(`variants.${index}.measurements.height`, {
              valueAsNumber: true,
            })}
          />
          <Input
            label="Depth (cm)"
            type="number"
            step="0.01"
            {...register(`variants.${index}.measurements.depth`, {
              valueAsNumber: true,
            })}
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.01"
            {...register(`variants.${index}.measurements.weight`, {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default VariantForm;

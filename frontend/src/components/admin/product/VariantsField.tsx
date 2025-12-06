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
  useEffect(() => {
    register(`variants.${index}.images`, {
      validate: (imgs: any[]) => {
        if (!Array.isArray(imgs) || imgs.length === 0)
          return "At least one image is required";
        const hasUploaded = imgs.some(
          (im) => typeof im?.public_id === "string" && im.public_id.length > 0
        );
        if (!hasUploaded)
          return "At least one uploaded image (public_id) is required";
        return true;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, register]);

  const handleImageUpload = (images: UploadedImage[]) => {
    if (images && images.length) {
      const firstPrimaryIdx = images.findIndex((i) => i.isPrimary);
      if (firstPrimaryIdx === -1) {
        images = images.map((img, i) => ({ ...img, isPrimary: i === 0 }));
      } else {
        images = images.map((img, i) => ({
          ...img,
          isPrimary: i === i ? i === firstPrimaryIdx : img.isPrimary,
        }));
      }
    }
    setValue(`variants.${index}.images`, images, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const hasDiscount = watch(`variants.${index}.hasDiscount`);
  const imageError =
    (errors?.variants && (errors.variants as any)[index]?.images) || undefined;

  return (
    <div className="border border-muted rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold">Variant {index + 1}</h4>
        <Button
          type="button"
          onClick={remove}
          className="bg-red-500 text-white text-sm px-3 py-1 rounded"
        >
          Remove
        </Button>
      </div>

      <ImageUploader
        folder="variants"
        maxFiles={5}
        onUpload={(images) => handleImageUpload(images)}
        defaultUrls={
          (getValues(`variants.${index}.images`) as UploadedImage[]) || []
        }
      />
      {imageError && (
        <p className="text-red-500 text-sm mt-1">
          {(imageError as any).message || imageError}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Color"
          placeholder="e.g. Brown"
          {...register(`variants.${index}.color`, {
            required: "Color is required",
          })}
          error={
            (errors?.variants &&
              (errors.variants as any)[index]?.color?.message) as
              | string
              | undefined
          }
        />
        <Input
          label="Size (optional)"
          placeholder="e.g. Medium"
          {...register(`variants.${index}.size`)}
          error={
            (errors?.variants &&
              (errors.variants as any)[index]?.size?.message) as
              | string
              | undefined
          }
        />

        <Input
          label="Base Price (₹)"
          type="number"
          step="0.01"
          {...register(`variants.${index}.basePrice`, {
            valueAsNumber: true,
            required: "Base price is required",
            validate: (v) =>
              typeof v === "number" && !isNaN(v) && v > 0
                ? true
                : "Base price must be > 0",
          })}
          error={
            (errors?.variants &&
              (errors.variants as any)[index]?.basePrice?.message) as
              | string
              | undefined
          }
        />
        <Input
          label="GST Rate (%)"
          type="number"
          step="0.01"
          {...register(`variants.${index}.gstRate`, {
            valueAsNumber: true,
            required: "GST rate is required",
          })}
        />

        <Input
          label="Listing Price (MRP) — optional"
          type="number"
          step="0.01"
          {...register(`variants.${index}.listingPrice`, {
            valueAsNumber: true,
          })}
        />

        <Input
          label="Stock"
          type="number"
          {...register(`variants.${index}.stock`, { valueAsNumber: true })}
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="checkbox"
            id={`hasDiscount-${index}`}
            className="w-4 h-4 text-blue-600 rounded"
            {...register(`variants.${index}.hasDiscount`)}
          />
          <label
            htmlFor={`hasDiscount-${index}`}
            className="text-sm font-medium"
          >
            Enable Discount (informational)
          </label>
        </div>

        {hasDiscount && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-3 rounded">
            <Input
              label="Discount % (informational only)"
              type="number"
              min="0"
              max="99"
              placeholder="e.g. 20"
              {...register(`variants.${index}.discountPercent`, {
                valueAsNumber: true,
              })}
            />
            <Input
              label="Valid Until"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register(`variants.${index}.discountValidUntil`)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantForm;

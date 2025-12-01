// components/admin/product/VariantForm.tsx
"use client";

import React, { useEffect } from "react";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  UseFormWatch,
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
}

const VariantForm: React.FC<VariantFormProps> = ({
  index,
  register,
  setValue,
  getValues,
  watch,
  remove,
}) => {
  // register images for validation
  useEffect(() => {
    // register manually so RHF validates images presence
    register(`variants.${index}.images`, {
      required: "At least one image is required",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, register]);

  const handleImageUpload = (images: UploadedImage[]) => {
    // ensure first image is primary if none selected
    if (images && images.length && !images.some((i) => i.isPrimary)) {
      images = images.map((img, i) => ({ ...img, isPrimary: i === 0 }));
    }
    setValue(`variants.${index}.images`, images, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const hasDiscount = watch(`variants.${index}.hasDiscount`);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Color"
          placeholder="e.g. Brown"
          {...register(`variants.${index}.color`, { required: true })}
        />
        <Input
          label="Size"
          placeholder="e.g. Medium"
          {...register(`variants.${index}.size`, { required: true })}
        />

        <Input
          label="Base Price"
          type="number"
          step="0.01"
          {...register(`variants.${index}.basePrice`, { valueAsNumber: true })}
        />
        <Input
          label="GST Rate (%)"
          type="number"
          {...register(`variants.${index}.gstRate`, { valueAsNumber: true })}
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
            Enable Discount
          </label>
        </div>

        {hasDiscount && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-3 rounded">
            <Input
              label="Discount %"
              type="number"
              min="0"
              max="70"
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

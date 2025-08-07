"use client";

import {
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";
import { Variant } from "@/types/Product";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import ImageUploader from "@/components/helperComponents/ImageUploader";

interface VariantFormProps {
  index: number;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  remove: () => void;
}

const VariantForm: React.FC<VariantFormProps> = ({
  index,
  register,
  setValue,
  getValues,
  remove,
}) => {
  const handleImageUpload = (images: Variant["images"]) => {
    setValue(`variants.${index}.images`, images);
  };

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

      {/* ⬆️ Move image section to the top */}
      <ImageUploader
        folder="variants"
        maxFiles={5}
        onUpload={(images) => setValue(`variants.${index}.images`, images)}
        defaultUrls={getValues(`variants.${index}.images`) || []}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Color"
          placeholder="e.g. Brown"
          {...register(`variants.${index}.color`)}
        />
        <Input
          label="Size"
          placeholder="e.g. Medium"
          {...register(`variants.${index}.size`)}
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
    </div>
  );
};

export default VariantForm;

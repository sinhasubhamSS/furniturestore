"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import toast from "react-hot-toast";
import { useCreateCategoryMutation } from "@/redux/services/admin/adminCategoryapi";
import ImageUploader from "@/components/helperComponents/ImageUploader";

interface CreateCategoryInput {
  name: string;
  image: {
    url: string;
    public_id: string;
  };
}

export default function CategoryForm() {
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryInput>();

  const onSubmit = async (data: CreateCategoryInput) => {
    try {
      await createCategory(data).unwrap();
      toast.success("Category created successfully!");
      reset(); // Clear the form
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 max-w-md mx-auto mt-10"
    >
      <h2 className="text-xl font-semibold">Create Category</h2>

      <Input
        label="Category Name"
        name="name"
        register={register("name", { required: "Name is required" })}
        error={errors.name?.message}
      />

      <ImageUploader
        folder="categories"
        maxFiles={1}
        onUpload={(urls) => {
          if (urls[0]) {
            setValue("image", urls[0], { shouldValidate: true });
          }
        }}
      />
      {errors.image?.url && (
        <p className="text-sm text-red-500">Image is required</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating..." : "Create Category"}
      </Button>
    </form>
  );
}

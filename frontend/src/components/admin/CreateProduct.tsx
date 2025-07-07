"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  createProductSchema,
  CreateProductInput,
} from "@/lib/validations/product.schema";
import axiosClient from "../../../utils/axios";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ImageUploader"; // 👈 your uploader

const CreateProduct = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      gstRate: 0,
      basePrice: 0,
      stock: 1,
      images: [],
      category: "",
    },
  });

  const onSubmit = async (data: CreateProductInput) => {
    console.log("Submitting data:", data);
    try {
      await axiosClient.post("/products/createproduct", data);
      toast.success("Product created successfully");
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto space-y-4"
    >
      <Input
        label="Name"
        name="name"
        register={register("name")}
        error={errors.name?.message}
      />
      <Input
        label="Title"
        name="title"
        register={register("title")}
        error={errors.title?.message}
      />
      <Input
        label="Description"
        name="description"
        register={register("description")}
        error={errors.description?.message}
      />
      <Input
        type="number"
        label="GST Rate"
        name="gstRate"
        register={register("gstRate", { valueAsNumber: true })}
        error={errors.gstRate?.message}
      />
      <Input
        type="number"
        label="Price"
        name="basePrice"
        register={register("basePrice", { valueAsNumber: true })}
        error={errors.basePrice?.message}
      />
      <Input
        type="number"
        label="Stock"
        name="stock"
        register={register("stock", { valueAsNumber: true })}
        error={errors.stock?.message}
      />
      <Input
        label="Category ID"
        name="category"
        register={register("category", {
          setValueAs: (value) => value.trim(), // Removes extra whitespace and quotes
        })}
        error={errors.category?.message}
      />
      {/* 👇 New ImageUploader integration */}
      <ImageUploader
        maxFiles={5}
        folder="products"
        onUpload={(urls) => {
          setValue("images", urls, { shouldValidate: true });
        }}
      />

      {errors.images?.message && (
        <p className="text-sm text-red-500">
          {errors.images.message as string}
        </p>
      )}

      <Button type="submit">Create Product</Button>
    </form>
  );
};

export default CreateProduct;

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
const CreateProduct = () => {
  const {
    register,
    handleSubmit,
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
    try {
      await axiosClient.post("/api/products/createproduct", data); // Adjust endpoint accordingly
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
        register={register("category")}
        error={errors.category?.message}
      />
      <Input
        label="Image URLs (comma separated)"
        name="images"
        register={register("images", {
          setValueAs: (v) => v.split(",").map((s: string) => s.trim()),
        })}
        error={errors.images?.message as string}
      />

      <Button type="submit">Create Product</Button>
    </form>
  );
};

export default CreateProduct;

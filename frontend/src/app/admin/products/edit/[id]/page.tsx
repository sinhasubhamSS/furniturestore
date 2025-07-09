"use client";

import { useParams } from "next/navigation";

import { CreateProductInput } from "@/lib/validations/product.schema";
import ProductForm from "@/components/admin/ProductForm";
import axiosClient from "../../../../../../utils/axios";

const EditProductPage = () => {
  const { id } = useParams();

  const handleUpdate = async (data: CreateProductInput) => {
    await axiosClient.put(`/products/admin/update/${id}`, data);
  };

  return (
    <ProductForm
      onSubmit={handleUpdate}
      isEdit={true}
      // optional: tu defaultValues yahan hardcoded ya props se bhej sakta hai
    />
  );
};

export default EditProductPage;

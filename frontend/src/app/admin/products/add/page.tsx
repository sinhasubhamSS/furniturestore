import ProductForm from "@/components/admin/ProductForm";
import axiosClient from "../../../../../utils/axios";
import { CreateProductInput } from "@/lib/validations/product.schema";


const AddProduct = () => {
  const handleCreate = async (data:CreateProductInput) => {
    await axiosClient.post("/products/createproduct", data);
  };

  return <ProductForm onSubmit={handleCreate} />;
};

export default AddProduct;

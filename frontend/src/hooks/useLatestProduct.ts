import { useEffect, useState } from "react";
import axiosClient from "../../utils/axios";

export interface Product {
  id: string;
  name: string;
  images: string[]; // You may need to check this field based on backend
  price: number;
}

const useLatestProducts = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosClient.get("/products/latest-products");
        console.log("response received for checking", response.data);

        // ✅ Validate structure: your API wraps data inside `data` field
        setProduct(response.data.data); // ← make sure this matches API response
      } catch (error) {
        console.error("Error fetching latest products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { product, loading };
};

export default useLatestProducts;

import { useEffect, useState } from "react";
import axiosClient from "../../utils/axios";

export interface Product {
  id: string;
  name: string;
  images: string[]; // just URLs
  price: number;
}

const useLatestProducts = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosClient.get("/products/latest-products");

        setProduct(
          response.data.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            images: item.images.map((img: any) => img.url), // ✅ Only URLs
          }))
        );
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

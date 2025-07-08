import { useEffect, useState } from "react";

import { AdminProductResponse } from "../types/Product";
import axiosClient from "../../utils/axios";

const useAdminProducts = (page: number = 1, limit: number = 10) => {
  const [data, setData] = useState<AdminProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosClient.get<{
          success: boolean;
          message: string;
          data: AdminProductResponse;
        }>(`/products/admin/getallproducts?page=${page}&limit=${limit}`);
        console.log(res.data.data);

        setData(res.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit]);

  return { data, loading, error };
};

export default useAdminProducts;

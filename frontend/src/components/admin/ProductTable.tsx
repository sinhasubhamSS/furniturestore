"use client";

import React from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
} from "@/redux/services/adminProductapi";
const ProductTable = () => {
  const { data, isLoading, error } = useGetAdminProductsQuery({
    page: 1,
    limit: 10,
  });
  console.log("Admin Products Response:", data);
  const products = data?.products || [];
  const router = useRouter();
  const [deleteProduct] = useDeleteProductMutation();
  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error fetching products</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--secondary-light)]">
      <table className="min-w-full text-sm text-[var(--foreground)] bg-[var(--secondary-light)]">
        <thead className="text-left font-semibold bg-[var(--secondary-light)]">
          <tr>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--secondary-light)]">
          {products.map((product) => (
            <tr
              key={product._id}
              className="hover:bg-[var(--secondary-light)]/90 transition"
            >
              <td className="px-4 py-2">
                <img
                  src={
                    product.images[0]?.url || "https://via.placeholder.com/60"
                  }
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-md border border-[var(--border)]"
                />
              </td>
              <td className="px-4 py-2 font-medium">{product.name}</td>
              <td className="px-4 py-2">{product.stock}</td>
              <td className="px-4 py-2">{product.category?.name}</td>
              <td className="px-4 py-2">₹{product.price.toLocaleString()}</td>
              <td className="px-4 py-2 text-center">
                <div className="flex items-center justify-center gap-3">
                  <button
                    title="Edit"
                    className="hover:text-[var(--color-accent)] transition-colors"
                    onClick={() =>
                      router.push(`/admin/products/edit/${product._id}`)
                    }
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    title="Delete"
                    className="hover:text-[var(--text-error)] transition-colors"
                    onClick={() => deleteProduct(product._id)}
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    title="View"
                    className="hover:text-[var(--color-accent)] transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;

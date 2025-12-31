"use client";

import React from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
} from "@/redux/services/admin/adminProductapi";
import type { DisplayProduct } from "@/types/Product";

const ProductTable: React.FC = () => {
  const { data, isLoading, error } = useGetAdminProductsQuery({
    page: 1,
    limit: 10,
  });

  // cast to typed array for TS safety
  const products = (data?.products as DisplayProduct[]) || [];
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
          {products.map((product: DisplayProduct) => {
            const v0 = product.variants?.[0]; // first variant fallback

            // --- IMAGE fallback chain ---
            const imageUrl =
              product.repThumbSafe ||
              product.repImage ||
              v0?.images?.[0]?.thumbSafe ||
              v0?.images?.[0]?.url ||
              "https://via.placeholder.com/60";

            // --- PRICE fallback chain ---
            const displayPrice =
              product.sellingPrice ??
              product.variants?.[0]?.sellingPrice ??
              null;

            // --- STOCK fallback chain ---
            const displayStock =
              typeof product.totalStock === "number"
                ? product.totalStock
                : v0?.stock ?? "—";

            return (
              <tr
                key={product._id}
                className="hover:bg-[var(--secondary-light)]/90 transition"
              >
                {/* IMAGE */}
                <td className="px-4 py-2">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-md border border-[var(--border)]"
                  />
                </td>

                {/* NAME */}
                <td className="px-4 py-2 font-medium">{product.name}</td>

                {/* STOCK */}
                <td className="px-4 py-2">{displayStock}</td>

                {/* CATEGORY */}
                <td className="px-4 py-2">
                  {typeof product.category === "string"
                    ? product.category
                    : product.category?.name ?? "—"}
                </td>

                {/* PRICE */}
                <td className="px-4 py-2">
                  {displayPrice
                    ? `₹${Number(displayPrice).toLocaleString()}`
                    : "—"}
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-2 text-center">
                  <div className="flex items-center justify-center gap-3">
                    {/* Edit */}
                    <button
                      title="Edit"
                      className="hover:text-[var(--color-accent)] transition-colors"
                      onClick={() =>
                        router.push(`/admin/products/edit/${product._id}`)
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      title="Delete"
                      className="hover:text-[var(--text-error)] transition-colors"
                      onClick={() => deleteProduct(product._id)}
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* View */}
                    <button
                      title="View"
                      className="hover:text-[var(--color-accent)] transition-colors"
                      onClick={() => router.push(`/products/${product._id}`)}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;

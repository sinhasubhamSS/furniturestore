"use client";

import React, { useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
} from "@/redux/services/admin/adminProductapi";
import type { DisplayProduct } from "@/types/Product";
import Pagination from "@/components/admin/od&rt/common/pagination";

const ProductTable: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useGetAdminProductsQuery({
    page,
    limit,
  });

  const [deleteProduct] = useDeleteProductMutation();

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error fetching products</p>;

  const products = (data?.products as DisplayProduct[]) || [];

  // ✅ CREATE PAGINATION OBJECT FROM FLAT RESPONSE
  const pagination = data
    ? {
        page: data.page,
        limit: data.limit,
        total: data.totalItems,
        pages: data.totalPages,
        hasNext: data.page < data.totalPages,
        hasPrev: data.page > 1,
      }
    : null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary-light)]">
      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-[var(--foreground)]">
          <thead className="text-left font-semibold">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {products.map((product) => {
              const v0 = product.variants?.[0];

              const imageUrl =
                product.repThumbSafe ||
                product.repImage ||
                v0?.images?.[0]?.thumbSafe ||
                v0?.images?.[0]?.url ||
                "https://via.placeholder.com/60";

              const displayPrice =
                product.sellingPrice ?? v0?.sellingPrice ?? null;

              const displayStock =
                typeof product.totalStock === "number"
                  ? product.totalStock
                  : (v0?.stock ?? "—");

              return (
                <tr key={product._id} className="hover:bg-black/5 transition">
                  <td className="px-4 py-3">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-md border"
                    />
                  </td>

                  <td className="px-4 py-3 font-medium">{product.name}</td>

                  <td className="px-4 py-3">{displayStock}</td>

                  <td className="px-4 py-3">
                    {typeof product.category === "string"
                      ? product.category
                      : (product.category?.name ?? "—")}
                  </td>

                  <td className="px-4 py-3">
                    {displayPrice
                      ? `₹${Number(displayPrice).toLocaleString()}`
                      : "—"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        title="Edit"
                        onClick={() =>
                          router.push(`/admin/products/edit/${product._id}`)
                        }
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        title="Delete"
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        title="View"
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

      {/* ================= PAGINATION ================= */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
};

export default ProductTable;

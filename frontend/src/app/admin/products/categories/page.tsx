"use client";

import { useRouter } from "next/navigation";
import CategoryList from "@/components/admin/CategoryList";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AdminCategoriesPage() {
  const router = useRouter();

  return (
    <div className="p-6 min-h-screen text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">All Categories</h2>

        <Button
          className="bg-[var(--color-accent)] hover:bg-[color-mix(in srgb, var(--color-accent) 90%, black 10%)] text-[var(--accent-foreground)] font-medium px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => router.push("/admin/products/categories/create")}
        >
          <Plus size={18} />
          Create Category
        </Button>
      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow">
        <CategoryList />
      </div>
    </div>
  );
}

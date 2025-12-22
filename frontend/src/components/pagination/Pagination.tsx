// components/pagination/Pagination.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex justify-center gap-3 mt-6">
      <Button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
      >
        ← Previous
      </Button>

      <span className="self-center">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
      >
        Next →
      </Button>
    </div>
  );
}

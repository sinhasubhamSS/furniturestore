"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SortDropdown from "@/components/filter/SortDropdown"; // ✅ UI import

interface Props {
  currentSort: string;
}

export default function SortDropdownClient({ currentSort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    params.set("page", "1"); // reset page
    router.push(`/products?${params.toString()}`);
  };

  return (
    <SortDropdown currentSort={currentSort} onSortChange={handleSortChange} />
  );
}

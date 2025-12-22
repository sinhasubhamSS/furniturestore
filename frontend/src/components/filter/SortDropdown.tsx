"use client";

interface SortOption {
  value: "latest" | "price_low" | "price_high" | "discount";
  label: string;
}

interface Props {
  currentSort: string;
  onSortChange: (value: string) => void;
}

export default function SortDropdown({ currentSort, onSortChange }: Props) {
  const options: SortOption[] = [
    { value: "latest", label: "Newest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "discount", label: "Best Deals" },
  ];

  return (
    <select
      value={currentSort}
      onChange={(e) => onSortChange(e.target.value)}
      className="border rounded px-3 py-2 text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

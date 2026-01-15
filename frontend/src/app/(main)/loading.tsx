import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] py-4">
      <div className="flex items-center justify-between gap-3 mb-4 px-4">
        <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
        <div className="h-8 w-32 bg-gray-300 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

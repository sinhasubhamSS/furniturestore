export default function ProductDetailLoading() {
  return (
    <div className="min-h-[calc(100vh-64px)] p-4 grid md:grid-cols-2 gap-6 animate-pulse">
      {/* LEFT: IMAGE GALLERY */}
      <div className="space-y-3">
        <div className="aspect-[1/1] bg-gray-200 rounded" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>

      {/* RIGHT: PRODUCT INFO */}
      <div className="space-y-4">
        <div className="h-6 w-3/4 bg-gray-300 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />

        <div className="h-6 w-32 bg-gray-300 rounded mt-4" />
        <div className="h-4 w-24 bg-gray-200 rounded" />

        <div className="mt-6 space-y-3">
          <div className="h-10 w-48 bg-gray-300 rounded" />
          <div className="h-10 w-40 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

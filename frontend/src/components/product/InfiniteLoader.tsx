export default function InfiniteLoader() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 mt-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-full bg-[--color-card] border rounded-md p-2 animate-pulse"
        >
          <div className="aspect-square bg-gray-300/40 rounded mb-2" />
          <div className="h-3 bg-gray-300/40 rounded mb-1" />
          <div className="h-3 w-2/3 bg-gray-300/40 rounded" />
        </div>
      ))}
    </div>
  );
}

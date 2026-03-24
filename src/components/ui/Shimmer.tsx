export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] overflow-hidden animate-pulse">
      <div className="h-[120px] bg-green-100" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-green-100 rounded-full w-1/3" />
        <div className="h-3 bg-green-100 rounded-full w-4/5" />
        <div className="h-3 bg-green-100 rounded-full w-3/5" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-5 bg-green-100 rounded-full w-1/4" />
          <div className="w-8 h-8 bg-green-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MiniCardSkeleton() {
  return (
    <div className="w-[150px] shrink-0 bg-white rounded-[18px] overflow-hidden animate-pulse">
      <div className="h-[110px] bg-green-100" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-green-100 rounded-full w-2/3" />
        <div className="h-3 bg-green-100 rounded-full w-full" />
        <div className="h-4 bg-green-100 rounded-full w-1/2" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] overflow-hidden shadow-sm flex-shrink-0 w-[148px]">
      <div className="h-[120px] bg-[#E8F5EE] animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-2 w-14 bg-[#E8F5EE] rounded animate-pulse" />
        <div className="h-3 w-full bg-[#E8F5EE] rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-[#E8F5EE] rounded animate-pulse" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-4 w-12 bg-[#E8F5EE] rounded animate-pulse" />
          <div className="w-7 h-7 bg-[#E8F5EE] rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-[20px] overflow-hidden shadow-sm">
          <div className="h-[120px] bg-[#E8F5EE] animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-2 w-14 bg-[#E8F5EE] rounded animate-pulse" />
            <div className="h-3 w-full bg-[#E8F5EE] rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-[#E8F5EE] rounded animate-pulse" />
            <div className="flex justify-between pt-1">
              <div className="h-4 w-12 bg-[#E8F5EE] rounded animate-pulse" />
              <div className="w-7 h-7 bg-[#E8F5EE] rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

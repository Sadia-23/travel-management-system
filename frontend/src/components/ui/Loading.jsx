import { FaSpinner } from 'react-icons/fa';

export function Spinner({ size = 'text-xl', className = '' }) {
  return <FaSpinner className={`animate-spin text-primary ${size} ${className}`} />;
}

/** Centered spinner + label, for a full section that's still loading. */
export function LoadingBlock({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-gray-500 ${className}`}>
      <Spinner size="text-2xl" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/** Skeleton placeholder shaped like the image + text cards used for hotels
 * and transport, so the layout doesn't jump once real data arrives. */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white">
      <div className="w-full h-44 animate-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 rounded animate-shimmer" />
        <div className="h-3 w-1/2 rounded animate-shimmer" />
        <div className="h-4 w-1/3 rounded animate-shimmer mt-3" />
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Thin row skeleton for table-like lists (bookings, users, etc). */
export function RowSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-white p-4 h-[68px] animate-shimmer" />
      ))}
    </div>
  );
}

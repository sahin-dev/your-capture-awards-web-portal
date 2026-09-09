import { Skeleton } from '@/components/ui/skeleton';

const ClosedContestCardSkeleton = () => {
  return (
    <div className="space-y-3 text-center">
      <Skeleton className="bg-surface-secondary mx-auto h-5 w-44 rounded-full" />

      <div className="border-border relative h-72 overflow-hidden rounded-xl border-2">
        <Skeleton className="bg-surface-secondary h-full w-full rounded-xl" />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/80 to-transparent" />
        <div className="absolute top-4 left-4 w-36">
          <Skeleton className="bg-surface-secondary h-5 w-full rounded-full" />
          <Skeleton className="bg-surface-secondary mt-2 h-3 w-24 rounded-full" />
        </div>

        <div className="text-foreground absolute inset-x-0 bottom-0 flex items-center justify-between bg-zinc-950/90 px-2 py-2">
          <div className="border-primary flex h-12 flex-1 flex-col items-center justify-center border-r px-2">
            <Skeleton className="bg-surface-secondary h-4 w-24 rounded-full" />
            <Skeleton className="bg-surface-secondary mt-2 h-3 w-14 rounded-full" />
          </div>
          <div className="border-primary flex h-12 flex-[1.3] flex-col items-center justify-center border-r px-2">
            <Skeleton className="bg-surface-secondary h-4 w-24 rounded-full" />
            <Skeleton className="bg-surface-secondary mt-2 h-3 w-16 rounded-full" />
          </div>
          <div className="flex h-12 flex-1 flex-col items-center justify-center px-2">
            <Skeleton className="bg-surface-secondary h-4 w-16 rounded-full" />
            <Skeleton className="bg-surface-secondary mt-2 h-3 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosedContestCardSkeleton;

'use client';

import { cn } from '@/utils/cn';

export function PhotoSkeleton({ isSidebarOpen = true }: { isSidebarOpen?: boolean }) {
  return (
    <div className="bg-background text-foreground relative flex h-screen overflow-hidden lg:flex-row">
      {/* Left: Photo placeholder — full width/height, mirrors the real section */}
      <section className="bg-surface relative flex h-full w-full flex-1 animate-pulse items-center justify-center">
        <div className="border-border size-20 animate-spin rounded-full border-4 border-t-zinc-600" />
        <span className="text-caption-foreground absolute bottom-6 text-xs font-bold tracking-widest uppercase">
          Loading...
        </span>
      </section>

      {/* Right: Sidebar placeholder — mirrors the exact same classes as the real <aside> in PublicPhotoPage */}
      <aside
        className={cn(
          'border-border bg-background text-foreground flex flex-col',
          // Desktop: static side pane
          'lg:static lg:z-auto lg:h-full lg:shrink-0 lg:border-l',
          isSidebarOpen ? 'lg:w-108.75' : 'lg:w-0 lg:overflow-hidden lg:border-l-0',
          // Mobile: full-screen overlay (same as real aside)
          'fixed inset-y-0 right-0 z-50 h-full w-full lg:static lg:inset-auto lg:z-auto',
          isSidebarOpen
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-full opacity-0 lg:pointer-events-auto lg:translate-x-0 lg:opacity-100',
        )}
      >
        {/* Header skeleton */}
        <div className="border-border bg-background flex border-b">
          <div className="flex flex-1 items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="bg-surface-secondary size-14 animate-pulse rounded-full md:size-16" />
              <div className="space-y-2">
                <div className="bg-surface-secondary h-4 w-28 animate-pulse rounded" />
                <div className="bg-surface-secondary h-3 w-16 animate-pulse rounded" />
                <div className="bg-surface-secondary mt-1 h-7 w-20 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics skeleton */}
        <div className="border-border bg-background grid grid-cols-3 border-b py-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="bg-surface-secondary size-6 animate-pulse rounded" />
              <div className="bg-surface-secondary h-4 w-10 animate-pulse rounded" />
              <div className="bg-surface h-2.5 w-12 animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Comments skeleton */}
        <div className="bg-background space-y-4 p-6">
          <div className="bg-surface-secondary h-3 w-24 animate-pulse rounded uppercase" />
          <div className="border-border bg-surface h-24 w-full animate-pulse rounded border" />
          <div className="space-y-4 pt-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="bg-surface-secondary size-9 animate-pulse rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="bg-surface-secondary h-3 w-24 animate-pulse rounded" />
                  <div className="bg-surface h-5 w-full animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

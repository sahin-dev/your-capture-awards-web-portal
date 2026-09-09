'use client';

import { Heart, MapPin, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useGetDiscoverPhotosQuery } from '@/store/apis/discoverApi';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { DiscoverPhotoItem } from '@/store/types/discoverTypes';

const LIMIT = 12;
const HERO_BANNER =
  'https://photos.gurushots.com/unsafe/2000x0/4a0728f5e918c8cc5b910bf98510198b/3_7c9e22eeb15a0276c78d91db5f020b6d.jpg';

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || '?'
  );
}

export default function DiscoverPage() {
  const [page, setPage] = useState(1);
  const [allPhotos, setAllPhotos] = useState<DiscoverPhotoItem[]>([]);

  const { data, isLoading, isFetching, isError } = useGetDiscoverPhotosQuery({
    page,
    limit: LIMIT,
  });

  const photos = data?.data ?? [];
  const meta = data?.meta;
  const hasMore = meta?.hasNextPage ?? false;

  useEffect(() => {
    if (!data?.data) return;

    setAllPhotos((prev) => {
      if (page === 1) {
        return data.data;
      }
      const existingIds = new Set(prev.map((item) => item.id));
      const newPhotos = data.data.filter((item) => !existingIds.has(item.id));
      return [...prev, ...newPhotos];
    });
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isFetching]);

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading: isFetching,
    onLoadMore: loadMore,
  });

  return (
    <main className="bg-background text-foreground min-h-screen pb-12">
      {/* Hero Banner Section */}
      <section className="relative flex h-[40vh] w-full items-center justify-center overflow-hidden md:h-[50vh]">
        <Image
          src={HERO_BANNER}
          alt="Discover Photography"
          fill
          priority
          unoptimized
          className="object-cover brightness-50"
        />
        <div className="from-background via-background/20 absolute inset-0 bg-linear-to-t to-transparent" />
        <div className="relative z-10 max-w-4xl px-4 text-center">
          <h1 className="font-kumbh text-foreground text-3xl font-bold tracking-tight text-balance drop-shadow-lg md:text-5xl lg:text-6xl">
            Discover Stunning Photography from Around the World
          </h1>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="margin container mt-8">
        {isLoading && allPhotos.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-surface-secondary/40 border-border aspect-4/3 animate-pulse overflow-hidden rounded-xl border"
              />
            ))}
          </div>
        ) : isError && allPhotos.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-destructive/10 text-destructive border-destructive/20 mx-auto flex size-12 items-center justify-center rounded-full border">
              <ImageIcon className="size-6" />
            </div>
            <h3 className="font-kumbh mt-4 text-2xl font-bold">Failed to load photos</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
              Please refresh the page or try again in a moment.
            </p>
          </div>
        ) : allPhotos.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-primary/10 text-primary border-primary/20 mx-auto flex size-12 items-center justify-center rounded-full border">
              <ImageIcon className="size-6" />
            </div>
            <h3 className="font-kumbh mt-4 text-2xl font-bold">No photos found</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
              Check back later for new photography submissions.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {allPhotos.map((item) => {
                const photoUrl = item.photo?.photo?.url || HERO_BANNER;
                const user = item.participant?.user;
                const name = user
                  ? user.fullName || `${user.firstName} ${user.lastName}`.trim()
                  : 'Anonymous';
                const avatar = user?.avatar;
                const location = user?.location;

                return (
                  <div
                    key={item.id}
                    className="group border-border bg-surface-secondary relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl border transition-all duration-300"
                  >
                    {/* Main Image */}
                    <Image
                      src={photoUrl}
                      alt={name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-b from-zinc-950/70 via-zinc-950/20 to-zinc-950/80 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Top Info overlay (Profile, Name, Location) */}
                    <div className="absolute inset-x-0 top-0 flex -translate-y-2 transform items-center gap-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <Avatar className="border-border-subtle size-9 shrink-0 border">
                        {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-semibold drop-shadow">
                          {name}
                        </p>
                        {location && (
                          <div className="text-muted-foreground flex items-center gap-1 text-xs">
                            <MapPin className="size-3" />
                            <span className="truncate drop-shadow">{location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Info overlay (Votes count) */}
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-2 transform items-center justify-between p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="border-border-subtle bg-overlay text-foreground flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs backdrop-blur-md">
                        <span className="font-semibold">{item.voteCount ?? 0} Votes</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore ? (
              <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
                {isFetching && <Loader2 className="text-primary size-8 animate-spin" />}
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

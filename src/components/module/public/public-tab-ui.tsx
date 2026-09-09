'use client';

import { useEffect, useState } from 'react';
import { useToggleLikeMutation } from '@/store/apis/socialApi';
import { useAppDispatch } from '@/store/hooks';
import { setSwiperPhotos } from '@/store/slices/profileSlice';
import { cn } from '@/utils/cn';
import { Eye, Heart, Loader2, Vote } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export const getPhotoAspect = (id: string) => {
  const aspects: Record<string, number> = {
    'sunflower-flight': 1.6,
    'little-king': 0.8,
    'bright-smile': 1.25,
    'soft-llama': 1.5,
    'market-rain': 1.0,
    'coastal-glow': 1.77,
  };
  return aspects[id] || 1.4;
};

export function PhotoCard({
  photo,
  profileUsername,
  isLikedDefault = false,
  showMetrics = true,
  allPhotos = [],
  ownerId,
  style,
}: {
  photo: any;
  profileUsername: string;
  isLikedDefault?: boolean;
  showMetrics?: boolean;
  allPhotos?: any[];
  ownerId?: string;
  style?: React.CSSProperties;
}) {
  const [liked, setLiked] = useState(isLikedDefault);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeMutation();

  useEffect(() => {
    setLiked(isLikedDefault);
  }, [isLikedDefault]);

  // Support both real API photos (photo.url) and mock photos (photo.src)
  const photoSrc = photo.url || photo.src || '';
  const photoAlt = photo.alt || photo.title || 'photo';
  const aspectId = photo.id || '';
  const aspect = getPhotoAspect(aspectId);

  const handleClick = () => {
    dispatch(setSwiperPhotos(allPhotos.length > 0 ? allPhotos : [photo]));
    const ownerParam = ownerId || photo.userId || '';
    router.push(
      `/photo/${photo.id}?source=profile&profile=${profileUsername}&ownerId=${ownerParam}`,
    );
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    try {
      const res = await toggleLike(photo.id).unwrap();
      if (res.success) {
        setLiked((prev) => !prev);
      }
    } catch (err: any) {}
  };

  return (
    <div
      className="group bg-surface hover:border-border/80 relative cursor-pointer overflow-hidden rounded-sm shadow-md transition-all duration-300 hover:shadow-xl"
      style={
        style || {
          height: '300px',
          flexGrow: aspect,
          flexBasis: `${aspect * 200}px`,
        }
      }
      onClick={handleClick}
    >
      <div className="relative block size-full">
        {photoSrc ? (
          <Image
            src={photoSrc}
            alt={photoAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="bg-surface-secondary text-caption-foreground flex size-full items-center justify-center text-xs">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Heart / Like Button */}
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={isLiking}
        className="border-border-subtle bg-overlay text-foreground hover:bg-overlay absolute top-3 right-3 z-10 cursor-pointer rounded-full border p-2 backdrop-blur-xs transition duration-200 select-none disabled:cursor-wait disabled:opacity-70"
      >
        {isLiking ? (
          <Loader2 className="text-foreground size-4.5 animate-spin" />
        ) : (
          <Heart
            className={cn(
              'size-4.5 transition duration-200',
              liked
                ? 'scale-110 fill-rose-500 text-rose-500'
                : 'text-foreground hover:text-rose-400',
            )}
          />
        )}
      </button>

      {/* Hover Information overlay */}
      {showMetrics && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="text-foreground flex flex-wrap items-center gap-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-1">
              <Vote size={18} />
              {(photo.totalVotes ?? photo.votes ?? 0).toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={18} />
              {(photo.views ?? 0).toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart size={18} />
              {(photo.likes ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TabSectionHeader({
  title,
  countLabel,
  action,
}: {
  title: string;
  countLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex justify-between gap-3">
      <div>
        <h3 className="text-foreground font-medium uppercase">{title}</h3>
        {countLabel ? <p className="text-foreground/45 text-xs">{countLabel}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function TabErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <section className="container py-10">
      <div className="border-destructive/20 bg-destructive/10 text-destructive-foreground rounded-2xl border p-6">
        <p className="font-semibold">{title}</p>
        <p className="text-foreground/75 mt-1 text-sm">{description}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="bg-destructive text-destructive-foreground mt-4 rounded-md px-4 py-2 text-sm font-semibold"
          >
            Retry
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function TabLoadingCard() {
  return <PhotoGridLoadingState count={1} />;
}

export function PhotoGridLoadingState({ count = 8 }: { count?: number }) {
  // Mock aspect ratios to simulate justified grid skeleton widths
  const mockAspects = [1.5, 0.8, 1.2, 1.8, 1.0, 1.4, 0.9, 1.6];
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, index) => {
        const aspect = mockAspects[index % mockAspects.length];
        return (
          <div
            key={index}
            className="bg-surface ring-border-subtle relative animate-pulse overflow-hidden rounded-lg ring-1"
            style={{
              flexGrow: aspect,
              flexBasis: `${aspect * 220}px`,
              height: '300px',
            }}
          >
            <div className="bg-surface-secondary/60 absolute inset-0" />
            <div className="bg-surface-secondary/60 absolute top-3 right-3 size-7 rounded-full" />
          </div>
        );
      })}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border-border/80 bg-surface/40 overflow-hidden rounded-lg border shadow-lg backdrop-blur-xs">
      {/* Banner */}
      <div className="bg-surface-secondary relative h-24 animate-pulse" />

      {/* Content */}
      <div className="relative -mt-6 px-4 pb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="border-border bg-surface-secondary size-16 shrink-0 animate-pulse rounded-full border-2" />

          {/* Text */}
          <div className="flex-1 pt-2">
            <div className="bg-surface-secondary h-5 w-28 animate-pulse rounded" />

            <div className="bg-surface-secondary/70 mt-2 h-3 w-20 animate-pulse rounded" />
          </div>
        </div>

        {/* Button */}
        <div className="bg-surface-secondary mt-5 h-9 w-full animate-pulse rounded-sm" />
      </div>
    </div>
  );
}

export function GridLoadingState({ count = 6 }: { count?: number }) {
  return <PhotoGridLoadingState count={count} />;
}

export function PeopleLoadingState({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function AchievementLoadingState() {
  return (
    <div className="border-border bg-surface/20 rounded-2xl border border-dashed p-8">
      <div className="bg-surface-secondary mx-auto h-5 w-40 animate-pulse rounded" />
      <div className="bg-surface-secondary/60 mx-auto mt-3 h-4 w-56 animate-pulse rounded" />
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-surface-secondary h-8 w-24 animate-pulse rounded-full" />
        ))}
      </div>
    </div>
  );
}

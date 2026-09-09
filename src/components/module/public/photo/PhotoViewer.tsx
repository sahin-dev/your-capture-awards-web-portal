'use client';

import { cn } from '@/utils/cn';
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Heart,
  Loader2,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface PhotoViewerProps {
  photo: any;
  slidePhotos: any[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onIndexChange: (idx: number) => void;
  isLiked: boolean;
  isLiking?: boolean;
  onToggleLike: () => void;
  backUrl: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isOwnPhoto?: boolean;
  isImageLoading?: boolean;
}

export function PhotoViewer({
  photo,
  slidePhotos,
  index,
  onPrev,
  onNext,
  onIndexChange,
  isLiked,
  isLiking = false,
  onToggleLike,
  backUrl,
  isSidebarOpen,
  onToggleSidebar,
  isOwnPhoto = false,
  isImageLoading = false,
}: PhotoViewerProps) {
  // Support both real API photos (photo.url) and mock photos (photo.src)
  const photoSrc = photo.url || photo.src || '';
  const photoAlt = photo.alt || photo.title || 'photo';
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen API toggle
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {}
  };

  // Listen to fullscreen changes to update state
  useEffect(() => {
    // Debug: log liked state for troubleshooting
    // eslint-disable-next-line no-console
    console.debug('PhotoViewer isLiked', isLiked, 'photoId', photo?.id);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen().catch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrev, onNext]);

  // Touch swiping handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartX.current = touch.clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX.current;
    const threshold = 50; // minimum distance for swipe in pixels

    if (deltaX > threshold) {
      onPrev(); // Swipe right -> previous photo
    } else if (deltaX < -threshold) {
      onNext(); // Swipe left -> next photo
    }

    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        'bg-background text-foreground relative flex flex-1 flex-col items-center justify-center transition-all duration-300 select-none',
        isFullscreen ? 'h-screen w-screen p-0' : 'h-full w-full',
      )}
    >
      {/* Top-Left Exit Close Button (closes page and goes back to profile/contest) */}
      {!isFullscreen && (
        <Link
          href={backUrl}
          className="border-border-subtle bg-overlay text-foreground hover:bg-overlay absolute top-6 left-6 z-20 grid size-10 place-items-center rounded-full border transition-colors duration-150"
          title="Exit and return to gallery"
        >
          <X className="size-5 stroke-[2.5]" />
        </Link>
      )}

      {/* Floating social share panel - shifted down to avoid overlapping the exit close button */}
      {/* {!isFullscreen && (
        <div className="absolute top-14 left-0 z-20">
          <SharePanel />
        </div>
      )} */}

      {/* Floating Close Cross overlay if in browser fullscreen */}
      {/* {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-6 right-20 z-30 grid size-10 cursor-pointer place-items-center rounded-full border border-border-subtle bg-overlay text-foreground transition-colors duration-150 hover:bg-overlay"
          title="Exit Fullscreen"
        >
          <Minimize2 className="size-5" />
        </button>
      )} */}

      {/* Love/Favorite Overlay Button — hidden for own photos */}
      {!isOwnPhoto && (
        <button
          onClick={onToggleLike}
          disabled={isLiking}
          className="border-border-subtle bg-overlay text-foreground hover:bg-overlay absolute top-6 right-20 z-20 grid size-10 cursor-pointer place-items-center rounded-full border drop-shadow-lg transition-transform duration-200 active:scale-95 disabled:cursor-wait disabled:opacity-70"
          title={isLiked ? 'Unlike photo' : 'Like photo'}
        >
          {isLiking ? (
            <Loader2 className="text-foreground size-5 animate-spin" />
          ) : (
            <Heart
              className={cn(
                'size-5 stroke-2 transition-all duration-300',
                isLiked
                  ? 'fill-destructive text-destructive scale-110'
                  : 'text-foreground hover:text-destructive hover:scale-105',
              )}
              // Ensure the SVG gets a fill when liked (lucide icons use stroke by default)
              fill={isLiked ? 'currentColor' : 'none'}
            />
          )}
        </button>
      )}

      {/* Top-Right Toggle Sidebar details/comments button (next to love button) */}
      {!isFullscreen && (
        <button
          onClick={onToggleSidebar}
          className="border-border-subtle bg-overlay text-foreground hover:bg-overlay absolute top-6 right-6 z-20 grid size-10 place-items-center rounded-full border transition-colors duration-150"
          title={isSidebarOpen ? 'Hide comments & details' : 'Show comments & details'}
        >
          <EllipsisVertical className="size-5" />
        </button>
      )}

      {/* Left Chevron Navigation */}
      {slidePhotos.length > 1 && (
        <button
          onClick={onPrev}
          className="bg-overlay text-foreground hover:bg-overlay absolute left-4 z-20 grid size-16 cursor-pointer place-items-center rounded-full transition-all duration-200 outline-none hover:scale-105"
          aria-label="Previous photo"
        >
          <ChevronLeft className="size-14 stroke-[1.2]" />
        </button>
      )}

      {/* Central Image View */}
      <div className="relative flex size-full items-center justify-center overflow-hidden">
        {/* Simple fading slide transition container */}
        <div
          key={photo.id}
          className="animate-fade-in relative flex size-full items-center justify-center"
        >
          {photoSrc ? (
            <Image
              src={photoSrc.replace(/\\/g, '/')}
              alt={photoAlt}
              fill
              className="pointer-events-none object-contain transition-transform duration-300 select-none"
              priority
            />
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Image-only loading spinner overlay — shown during prev/next API calls */}
        {isImageLoading && (
          <div className="bg-overlay absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="text-muted-foreground size-12 animate-spin" />
          </div>
        )}
      </div>

      {/* Right Chevron Navigation */}
      {slidePhotos.length > 1 && (
        <button
          onClick={onNext}
          className="bg-overlay text-foreground hover:bg-overlay absolute right-4 z-20 grid size-16 cursor-pointer place-items-center rounded-full transition-all duration-200 outline-none hover:scale-105"
          aria-label="Next photo"
        >
          <ChevronRight className="size-14 stroke-[1.2]" />
        </button>
      )}

      {/* Fullscreen Button overlay (bottom-right) */}
      <button
        onClick={toggleFullscreen}
        className="border-border-subtle bg-overlay text-foreground hover:bg-overlay absolute right-6 bottom-6 z-20 grid size-10 cursor-pointer place-items-center rounded-full border transition-all duration-150"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
      </button>

      {/* Bottom slide index dots indicator */}
      {/* {slidePhotos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full border border-border-subtle bg-overlay px-3 py-1.5 backdrop-blur-xs">
          {slidePhotos.map((item, itemIndex) => (
            <button
              key={item.id}
              onClick={() => onIndexChange(itemIndex)}
              className={cn(
                'cursor-pointer transition-all duration-300',
                itemIndex === index
                  ? 'h-1.5 w-6 rounded-full bg-primary-foreground'
                  : 'size-1.5 rounded-full bg-surface-secondary hover:bg-surface-secondary',
              )}
              aria-label={`Go to slide ${itemIndex + 1}`}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}

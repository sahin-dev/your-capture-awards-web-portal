'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import Image from 'next/image';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { useCreateVoteMutation, useLazyGetContestPhotosQuery } from '@/store/apis/contestApi';
import { useGetUserProgressQuery, type UserProgress } from '@/store/apis/levelsApi';

import { useJustifiedLayout } from '@/hooks/useJustifiedLayout';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

import ReportUserModal, { type ReportUserModalRef } from '@/components/ReportUserModal';

export interface VoteModalRef {
  open: () => void;
}

interface VoteModalProps {
  id: string;
}

interface ContestPhoto {
  id: string;
  url: string;
  voteCount: number;
}

const LIMIT = 10;

// Only these voting-power values have a matching icon asset in /public/icons.
const VOTING_POWER_ICON_STEPS = [2, 4, 6, 8, 10, 12, 14, 16, 18];

// Resolve the icon for the user's *actual* voting power, preferring an exact
// match over the old clamp-and-round approximation:
//   1. The power itself matches a known icon — use it directly.
//   2. Otherwise, fall back to the current level's canonical votePower (from
//      the levels list the progress endpoint already returns), if that
//      matches a known icon.
//   3. Only as a last resort, clamp + snap to the nearest known icon so the
//      stamp still renders something reasonable — and warn in dev so a real
//      mismatch (e.g. voting power above 18, or off the 2-step scale) is
//      visible instead of silently showing the wrong badge.
const resolveVotingPowerIcon = (power: number, levels?: UserProgress['levels'], currentOrder?: number) => {
  const numericPower = Number(power);

  if (VOTING_POWER_ICON_STEPS.includes(numericPower)) {
    return `/icons/voting-power-${numericPower}.png`;
  }

  const currentLevel = levels?.find((level) => level.order === currentOrder);
  if (currentLevel && VOTING_POWER_ICON_STEPS.includes(currentLevel.votePower)) {
    return `/icons/voting-power-${currentLevel.votePower}.png`;
  }

  const normalized = Math.max(2, Math.min(18, numericPower || 0));
  const closest = VOTING_POWER_ICON_STEPS.reduce((best, current) =>
    Math.abs(current - normalized) < Math.abs(best - normalized) ? current : best,
  VOTING_POWER_ICON_STEPS[0]);

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[VoteModal] No exact voting-power icon for power=${power}; falling back to voting-power-${closest}.png`,
    );
  }

  return `/icons/voting-power-${closest}.png`;
};

const VoteModal = forwardRef<VoteModalRef, VoteModalProps>(({ id }, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<ContestPhoto[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const seedRef = useRef<string | undefined>(undefined);
  // isLoading from the lazy query only reflects the *first-ever* fetch for
  // this hook instance — on re-open we clear `photos` and force a refetch,
  // but isLoading stays false, so the empty-state briefly flashes before the
  // new data lands. Track the open-triggered fetch ourselves instead.
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const reportModalRef = useRef<ReportUserModalRef>(null);

  const [trigger, { isFetching }] = useLazyGetContestPhotosQuery();
  const [voteUpload, { isLoading: voteLoading }] = useCreateVoteMutation();
  const { data: userProgressData } = useGetUserProgressQuery(undefined, { skip: false });

  const userVotingPower =
    userProgressData?.data?.currentStatus?.votingPower ??
    0;
  const votingPowerIcon = resolveVotingPowerIcon(
    userVotingPower,
    userProgressData?.data?.levels,
    userProgressData?.data?.currentStatus?.order,
  );

  const fetchPhotos = useCallback(
    async (targetPage: number, reset = false) => {
      try {
        const res = await trigger(
          { id, page: targetPage, limit: LIMIT, seed: reset ? undefined : seedRef.current },
          // Backend randomizes the response on every call, so always force a
          // fresh network request — serving the RTK Query cache here would
          // keep replaying whatever order was first fetched.
          false,
        ).unwrap();

        if (res?.meta?.seed) seedRef.current = res.meta.seed;

        const incomingPhotos = (res?.data || [])
          .map((photo) => ({
            ...photo,
            url: resolveImageUrl(photo.url),
          }))
          .filter((photo) => Boolean(photo.id && photo.url));

        setHasNextPage(res?.meta?.hasNextPage ?? false);

        setPage(targetPage);

        setPhotos((prev) => {
          if (reset) return incomingPhotos;

          const map = new Map<string, ContestPhoto>();

          prev.forEach((item) => map.set(item.id, item));

          incomingPhotos.forEach((item) => map.set(item.id, item));

          return Array.from(map.values());
        });
      } catch (error) {}
    },
    [id, trigger],
  );

  useImperativeHandle(ref, () => ({
    open: async () => {
      setOpen(true);
      setSelectedIds([]);
      setPage(1);
      setHasNextPage(true);
      seedRef.current = undefined;

      // If we already have cached photos for page 1, show them immediately
      // (photos state keeps the previous session; reset them first so the
      // cached response repopulates cleanly).
      setPhotos([]);
      setInitialLoading(true);

      try {
        await fetchPhotos(1, true);
      } finally {
        setInitialLoading(false);
      }
    },
  }));

  const loadMore = useCallback(async () => {
    if (isFetching || !hasNextPage) return;

    await fetchPhotos(page + 1);
  }, [fetchPhotos, hasNextPage, isFetching, page]);

  useEffect(() => {
    const target = observerRef.current;

    if (!target || !open) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '300px',
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, open]);

  const toggleVote = (photoId: string) => {
    setSelectedIds((prev) =>
      prev.includes(photoId) ? prev.filter((item) => item !== photoId) : [...prev, photoId],
    );
  };

  const handleSubmit = async () => {
    if (!id || selectedIds.length === 0) return;

    try {
      await voteUpload({
        id,
        photoIds: selectedIds,
      }).unwrap();

      toast.success('Your votes have been submitted successfully!');

      setOpen(false);

      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || err?.data?.message || 'Something went wrong. Please try again', {
        position: 'top-right',
      });
    }
  };

  const { containerRef, rows } = useJustifiedLayout({
    items: photos.map((p) => ({ ...p })),
    targetHeight: 350,
    gap: 2,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border flex h-[95vh] max-h-[95vh] w-[95vw] max-w-[95vw] flex-col overflow-hidden border-2 p-0 sm:max-h-[95vh] sm:max-w-[95vw]">
        <VisuallyHidden>
          <DialogTitle />
        </VisuallyHidden>

        <div className="relative size-full flex-1 scrollbar-thin overflow-x-hidden overflow-y-auto">
          {initialLoading ? (
            <div className="flex flex-wrap gap-0.5 p-0.5">
              {[...Array(16)].map((_, i) => {
                const aspects = [1.3, 0.8, 1.5, 1.0, 1.8, 1.2, 0.9, 1.6];
                const a = aspects[i % aspects.length];
                return (
                  <Skeleton
                    key={i}
                    className="bg-surface-secondary rounded"
                    style={{ height: 350, width: 350 * a, flexShrink: 0 }}
                  />
                );
              })}
            </div>
          ) : photos.length > 0 ? (
            <>
              <div ref={containerRef} className="w-full">
                {rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="mb-0.5 flex"
                    style={{ height: `${row.height}px`, gap: '2px' }}
                  >
                    {row.items.map(({ item: img, width, height }) => {
                      const selected = selectedIds.includes(img.id);
                      return (
                        <div
                          key={img.id}
                          className="group relative shrink-0 overflow-hidden rounded"
                          style={{ width: `${width}px`, height: `${height}px` }}
                        >
                          <button
                            onClick={() => toggleVote(img.id)}
                            className="block h-full w-full"
                          >
                            <Image
                              src={img.url}
                              alt={`Vote Image`}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="rounded bg-zinc-950 object-cover transition duration-300 group-hover:opacity-90"
                            />

                            {selected && (
                              <div className="bg-overlay absolute inset-0 flex items-center justify-center backdrop-blur-[2px] transition">
                                <Image
                                  src={votingPowerIcon}
                                  alt="voting power badge"
                                  width={150}
                                  height={150}
                                  className="size-1/2 object-contain opacity-90 drop-shadow-lg"
                                />
                              </div>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              reportModalRef.current?.open(img.id);
                            }}
                            title="Report user"
                            aria-label="Report user"
                            className="bg-overlay text-foreground hover:bg-background/70 absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full opacity-0 transition group-hover:opacity-100"
                          >
                            <Flag className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <ReportUserModal ref={reportModalRef} />

              {isFetching && (
                <div className="flex flex-wrap gap-0.5 p-0.5">
                  {[...Array(4)].map((_, i) => {
                    const aspects = [1.3, 0.8, 1.5, 1.0];
                    const a = aspects[i % aspects.length];
                    return (
                      <Skeleton
                        key={i}
                        className="bg-surface-secondary rounded"
                        style={{ height: 200, width: 200 * a, flexShrink: 0 }}
                      />
                    );
                  })}
                </div>
              )}

              <div ref={observerRef} className="h-10 w-full" />
            </>
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center p-5 text-center text-lg">
              No photos available for voting yet. Stay tuned and be ready to cast your vote soon!
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={voteLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 absolute right-5 bottom-5 rounded px-5 py-2 font-medium uppercase shadow-lg transition disabled:opacity-60"
          >
            {voteLoading ? 'Submitting...' : 'SUBMIT VOTES'}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
});

VoteModal.displayName = 'VoteModal';

export default VoteModal;

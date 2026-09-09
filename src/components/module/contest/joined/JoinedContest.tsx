'use client';

import { LevelProgressBar } from '@/components/LevelProgressBar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import VoteModal, { VoteModalRef } from '@/components/VoteModal';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useGetJoinedContestQuery, useGetVoteCountsQuery } from '@/store/apis/contestApi';
import { useGetAllLevelsQuery, useGetUserProgressQuery } from '@/store/apis/levelsApi';
import { cn } from '@/utils/cn';
import { labels, totalLevels } from '@/utils/valueToExposureLabel';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import ContestActionModal, { ContestActionModalRef } from './ContestActionModal';
import JoinedContestCard, { getContestPhotoId } from './JoinedContestCard';
import JoinedContestCardSkeleton from './JoinedContestCardSkeleton';

// Stable reference so the accumulation effect below doesn't re-fire every render -
// `?? []` would create a brand-new array each render, and since that's an effect
// dependency, it caused an infinite render loop while `data` was still loading.
const EMPTY_CONTESTS: any[] = [];

const JoinedContest = () => {
  const searchParams = useSearchParams();
  const joinSuccess = searchParams.get('modal');
  const contestId = searchParams.get('contestId');
  const contestTitle = searchParams.get('contestTitle');
  const voteModalRef = useRef<VoteModalRef>(null);

  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [uploadModal, setUploadModal] = useState(false);
  const [page, setPage] = useState(1);
  const [allContests, setAllContests] = useState<any[]>([]);
  const actionModalRef = useRef<ContestActionModalRef>(null);

  // Set mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all levels (public endpoint)
  const { data: levelsData, isLoading: isLevelsLoading } = useGetAllLevelsQuery({
    page: 1,
    limit: 50,
  });

  // Fetch progress if authenticated
  const { data: progressData, isLoading: isProgressLoading } = useGetUserProgressQuery(undefined, {
    skip: !isAuthenticated,
  });

  const userProgress = progressData?.data ?? null;
  const allLevels =
    userProgress?.levels?.map((level) => ({
      id: `progress-${level.order}`,
      level: level.order,
      levelName: level.name,
      order: level.order,
      requirements: level.requirements,
    })) ??
    levelsData?.data ??
    [];
  const currentLevelOrder = userProgress?.currentStatus?.order ?? null;

  const { data, isLoading, isFetching, refetch, isError, error } = useGetJoinedContestQuery(
    { page, limit: 10 },
    {
      pollingInterval: 60_000,
      refetchOnMountOrArgChange: false,
    },
  );

  const firstActiveContest = (data as any)?.data?.find(
    (c: any) => c.status === 'ACTIVE' || !c.status,
  );
  const joinedResult = (data as any)?.data ?? EMPTY_CONTESTS;
  const hasMore = Boolean((data as any)?.meta?.hasNextPage);
  const voteContestId = (firstActiveContest?.id as string | undefined) ?? contestId ?? '';

  useEffect(() => {
    if (page === 1) {
      setAllContests(joinedResult);
      return;
    }
    setAllContests((prev) => {
      const existingIds = new Set(prev.map((contest) => contest.id));
      return [...prev, ...joinedResult.filter((contest: any) => !existingIds.has(contest.id))];
    });
  }, [joinedResult, page]);

  // Every submitted photo slot currently on screen, polled for its live vote
  // count on a short interval - a dedicated, tiny endpoint instead of
  // re-fetching the full joined-contest payload (banner, rules, etc.) just to
  // catch a vote count changing. Capped at 100 to match the backend's limit
  // on this endpoint even if infinite-scroll has accumulated more than that.
  const contestPhotoIds = useMemo(() => {
    const ids = allContests.flatMap((contest: any) =>
      Array.isArray(contest?.photos)
        ? contest.photos.map((photo: any, index: number) => getContestPhotoId(photo, index))
        : [],
    );
    return Array.from(new Set(ids)).slice(0, 100);
  }, [allContests]);

  const { data: voteCountsData } = useGetVoteCountsQuery(
    { contestPhotoIds },
    { skip: contestPhotoIds.length === 0, pollingInterval: 8_000 },
  );

  const liveVoteCounts = useMemo(() => {
    const map: Record<string, number> = {};
    voteCountsData?.data?.forEach((entry) => {
      map[entry.contestPhotoId] = entry.voteCount;
    });
    return map;
  }, [voteCountsData]);

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading: isFetching,
    onLoadMore: () => setPage((prev) => prev + 1),
  });

  useEffect(() => {
    if (joinSuccess === 'joinSuccess') {
      setUploadModal(true);
    }
  }, [joinSuccess]);

  const clearSearchParams = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('modal');
    url.searchParams.delete('contestId');
    url.searchParams.delete('contestTitle');
    window.history.replaceState({}, '', url.toString());
  };

  const handleVoteClick = () => {
    if (!voteContestId) return;
    voteModalRef.current?.open();
    setUploadModal(false);
    clearSearchParams();
  };

  const handleChargeClick = () => {
    if (!voteContestId) return;
    actionModalRef.current?.open('boost');
    setUploadModal(false);
    clearSearchParams();
  };

  return (
    <section className="">
      {/* Level Progress Tracker */}
      <div className="mb-8">
        {!mounted || isLevelsLoading || (isAuthenticated && isProgressLoading) ? (
          <div className="bg-surface-secondary/80 h-11 w-full animate-pulse rounded-lg" />
        ) : allLevels.length > 0 ? (
          <LevelProgressBar levels={allLevels} currentLevelOrder={currentLevelOrder} />
        ) : null}
      </div>

      <div className="my-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {isLoading ? (
          [1, 2, 3, 4].map((_, index) => <JoinedContestCardSkeleton key={index} />)
        ) : isError ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 py-20 text-center">
            <AlertTriangle className="text-primary size-10" />
            <div>
              <p className="text-lg font-semibold">Could not load joined contests.</p>
              <p className="text-muted-foreground text-sm">
                {(error as any)?.data?.message ?? 'Please try again in a moment.'}
              </p>
            </div>
            <Button onClick={() => void refetch()}>Retry</Button>
          </div>
        ) : allContests.length <= 0 ? (
          <div className="col-span-full flex w-full flex-col items-center justify-center py-20">
            <Image alt="" src="/images/no-result-found.webp" width={400} height={400} />
            <p>No Data Found!</p>
          </div>
        ) : (
          allContests.map((contest: any, index: number) => (
            <JoinedContestCard
              key={index}
              contest={contest}
              refetch={refetch}
              liveVoteCounts={liveVoteCounts}
            />
          ))
        )}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="my-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {hasMore &&
          isFetching &&
          [1, 2].map((_, index) => <JoinedContestCardSkeleton key={index} />)}
      </div>

      {/* Upload/Join Success Modal */}
      <Dialog
        open={uploadModal}
        onOpenChange={(open) => {
          setUploadModal(open);
          if (!open) clearSearchParams();
        }}
      >
        <DialogContent className="border-border border-2 sm:max-w-2xl">
          <DialogTitle />
          <div className="space-y-5">
            <h1 className="text-center text-lg font-semibold uppercase sm:text-xl">
              YOU HAVE JOINED <span className="text-primary">&apos;{contestTitle}&apos;</span>{' '}
              CHALLENGE
            </h1>

            <div className="space-y-5">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-muted-foreground text-xs uppercase">Exposure</div>
                <div className="border-border relative flex size-25 flex-col items-center justify-center rounded-full border-4">
                  <div className="text-caption-foreground flex w-full justify-between px-3 text-[10px]">
                    {labels.map((l, i) => (
                      <span key={i} className={cn(i + 1 <= 0 && 'text-primary font-semibold')}>
                        {l}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: totalLevels }).map((_, i) => {
                      const active = i + 1 <= 0;
                      return (
                        <div
                          key={i}
                          className={cn(
                            'h-1.5 w-3.5 rounded transition',
                            active ? 'bg-primary' : 'bg-surface-tertiary',
                          )}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border-subtle flex items-center justify-center gap-10 border-t-[0.5px] pt-5">
              <button
                onClick={handleChargeClick}
                className="text-primary border-primary rounded-sm border px-5 py-2 text-sm"
              >
                Promote
              </button>
              <button
                onClick={handleVoteClick}
                className="bg-primary text-primary-foreground rounded-sm px-5 py-2 text-sm"
              >
                Vote
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vote Modal */}
      <VoteModal ref={voteModalRef} id={voteContestId} />
      <ContestActionModal
        ref={actionModalRef}
        contestId={voteContestId}
        contestTitle={contestTitle ?? firstActiveContest?.title ?? ''}
        contestPhotos={firstActiveContest?.photos ?? []}
        onSuccess={() => void refetch()}
      />
    </section>
  );
};

export default JoinedContest;

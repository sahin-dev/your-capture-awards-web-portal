'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  useGetContestRankPhotosQuery,
  useLazyGetContestRankPhotographersQuery,
} from '@/store/apis/contestApi';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setSwiperPhotos } from '@/store/slices/profileSlice';
import { MdOutlineHowToVote } from 'react-icons/md';

// Stable references for the "no data yet" fallback - a fresh `[]` literal on every
// render would change identity each time even though it's logically the same empty
// list, which fed straight into a useEffect dependency below and caused an infinite
// render loop while the query was still loading (setState with a new array -> effect
// reruns because the dep "changed" -> setState with another new array -> ...).
const EMPTY_PHOTOS: any[] = [];
const EMPTY_PHOTOGRAPHERS: any[] = [];

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="col-span-full flex flex-col items-center justify-center text-center">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-muted-foreground mt-2 text-sm">{description}</p>
  </div>
);

const RankTab = ({ value, id }: { value: string; id: string }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeRankTab, setActiveRankTab] = useState<'top-photo' | 'top-photographer'>('top-photo');
  const [photoPage, setPhotoPage] = useState(1);
  const [photoItems, setPhotoItems] = useState<any[]>([]);
  const [photographerPage, setPhotographerPage] = useState(1);
  const [photographerItems, setPhotographerItems] = useState<any[]>([]);
  const {
    data: rankPhotosData,
    isLoading: isRankPhotosLoading,
    isFetching: isRankPhotosFetching,
  } = useGetContestRankPhotosQuery({
    id,
    page: photoPage,
    limit: 12,
  });
  const rankPhotos = rankPhotosData?.data ?? EMPTY_PHOTOS;
  const rankPhotosHasMore = Boolean(rankPhotosData?.meta?.hasNextPage);

  const [
    loadRankPhotographers,
    {
      data: rankPhotographersDataPage,
      isLoading: isRankPhotographerLoadingPage,
      isFetching: isRankPhotographerFetching,
    },
  ] = useLazyGetContestRankPhotographersQuery();
  const rankPhotographers = rankPhotographersDataPage?.data?.participants ?? EMPTY_PHOTOGRAPHERS;
  const rankPhotographersHasMore = Boolean(rankPhotographersDataPage?.meta?.hasNextPage);

  useEffect(() => {
    setPhotoPage(1);
    setPhotographerPage(1);
    setPhotoItems([]);
    setPhotographerItems([]);
  }, [id]);

  useEffect(() => {
    if (photoPage === 1) {
      setPhotoItems(rankPhotos);
      return;
    }
    setPhotoItems((prev) => {
      const seen = new Set(prev.map((item) => item.id));
      return [...prev, ...rankPhotos.filter((item: any) => !seen.has(item.id))];
    });
  }, [rankPhotos, photoPage]);

  useEffect(() => {
    if (photographerPage === 1) {
      setPhotographerItems(rankPhotographers);
      return;
    }
    setPhotographerItems((prev) => {
      const seen = new Set(prev.map((item) => item.id));
      return [...prev, ...rankPhotographers.filter((item: any) => !seen.has(item.id))];
    });
  }, [rankPhotographers, photographerPage]);

  useEffect(() => {
    if (activeRankTab === 'top-photographer') {
      loadRankPhotographers({ id, page: photographerPage, limit: 12 });
    }
  }, [activeRankTab, id, loadRankPhotographers, photographerPage]);

  const { loadMoreRef: photoLoadMoreRef } = useInfiniteScroll({
    hasMore: activeRankTab === 'top-photo' && rankPhotosHasMore,
    isLoading: isRankPhotosFetching,
    onLoadMore: () => setPhotoPage((prev) => prev + 1),
  });

  const { loadMoreRef: photographerLoadMoreRef } = useInfiniteScroll({
    hasMore: activeRankTab === 'top-photographer' && rankPhotographersHasMore,
    isLoading: isRankPhotographerFetching,
    onLoadMore: () => setPhotographerPage((prev) => prev + 1),
  });

  return (
    <TabsContent value={value} className="mx-auto w-full max-w-4xl">
      <Tabs
        value={activeRankTab}
        onValueChange={(value: any) => setActiveRankTab(value)}
        className="space-y-10"
      >
        <TabsList className="bg-background mx-auto flex size-full max-w-xl items-center justify-center p-1">
          <TabsTrigger
            value="top-photo"
            className="data-[state=active]:border-primary data-[state=active]:text-primary hover:text-primary flex w-full items-center justify-center border-transparent py-3 transition"
          >
            Top Photo
          </TabsTrigger>
          <TabsTrigger
            value="top-photographer"
            className="data-[state=active]:border-primary data-[state=active]:text-primary hover:text-primary flex w-full items-center justify-center border-transparent py-3 transition"
          >
            Top Photographer
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="top-photo"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {isRankPhotosLoading ? (
            [1, 2, 3, 4, 5, 6].map((_, index) => (
              <Skeleton key={index} className="bg-surface-secondary h-72 w-full rounded-xl" />
            ))
          ) : photoItems.length <= 0 ? (
            <EmptyState
              title="No ranked photos yet"
              description="There are no ranked photos available for this contest right now."
            />
          ) : (
            photoItems?.map((topPhoto: any, index: number) => {
              const handlePhotoClick = () => {
                const photosToSet = photoItems.map((p) => ({
                  id: p.userPhotoId ?? p.contestPhotoId ?? p.id,
                  url: p.url,
                  userId: p.photographer?.id ?? null,
                  title: p.title ?? '',
                  views: 0,
                  likes: 0,
                  totalVotes: p.voteCount ?? 0,
                }));

                dispatch(setSwiperPhotos(photosToSet));

                const ownerIdForPhoto = topPhoto.photographer?.id ?? '';
                const photoId = topPhoto.userPhotoId ?? topPhoto.contestPhotoId ?? topPhoto.id;
                const ownerQuery = ownerIdForPhoto ? `&ownerId=${ownerIdForPhoto}` : '';
                if (photoId)
                  router.push(`/photo/${photoId}?source=contest&contest=${id}${ownerQuery}`);
              };

              return (
                <div
                  key={index}
                  className="group relative cursor-pointer overflow-hidden rounded-xl"
                  onClick={handlePhotoClick}
                >
                  {topPhoto?.url ? (
                    <Image
                      src={topPhoto.url}
                      alt=""
                      width={400}
                      height={260}
                      className="h-72 w-full rounded-xl object-cover transition-all duration-500 group-hover:brightness-60"
                    />
                  ) : (
                    <div className="bg-surface-secondary h-72 w-full rounded-xl" />
                  )}

                  <div className="bg-overlay absolute top-2 left-2 rounded px-2 py-1 font-bold">
                    #{index + 1}
                  </div>

                  <div className="bg-overlay absolute bottom-2 left-2 flex items-center gap-1 rounded px-2 py-1 text-sm">
                    <MdOutlineHowToVote />
                    {topPhoto?.voteCount}
                  </div>

                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      const profileIdentifier =
                        topPhoto?.photographer?.username || topPhoto?.photographer?.id || '';
                      if (profileIdentifier) router.push(`/profile/${profileIdentifier}`);
                    }}
                  >
                    {topPhoto?.photographer?.avatar ? (
                      <Image
                        src={topPhoto.photographer.avatar}
                        alt="Profile avatar"
                        width={70}
                        height={70}
                        className="bg-foreground mb-2 size-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-surface-secondary mb-2 h-16 w-16 rounded-full" />
                    )}
                    <p className="font-semibold">{topPhoto?.photographer?.fullName}</p>
                    <p className="text-background-2-50">{topPhoto?.photographer?.location}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={photoLoadMoreRef} className="col-span-full">
            {activeRankTab === 'top-photo' && rankPhotosHasMore && isRankPhotosFetching && (
              <div className="grid min-h-80 grid-cols-1 gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((_, index) => (
                  <Skeleton key={index} className="bg-surface-secondary h-72 w-full rounded-xl" />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="top-photographer" className="space-y-16">
          {isRankPhotographerLoadingPage ? (
            [50, 30, 15, 5].map((value, index) => (
              <div key={index} className="space-y-4">
                {/* Header: Avatar, Name, Country, Follow, Votes */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                  <div className="flex items-center gap-3 sm:w-2/5 lg:w-1/3">
                    {/* Avatar Skeleton */}
                    <Skeleton className="bg-surface-secondary size-14 rounded-full sm:size-20" />
                    <div className="min-w-0 space-y-1">
                      {/* Name Skeleton */}
                      <Skeleton className="bg-surface-secondary h-5 w-32 rounded" />
                      {/* Country Skeleton */}
                      <Skeleton className="bg-surface-secondary h-4 w-20 rounded" />
                    </div>
                  </div>

                  {/* Votes Bar + Rank */}
                  <div className="flex w-full min-w-0 items-center">
                    <div className="bg-border -mr-4 flex h-10 min-w-0 flex-1 items-center justify-end rounded-l-full px-2 sm:-mr-5 sm:h-12">
                      <Skeleton
                        className="bg-surface-secondary h-8 max-w-full rounded-l-full sm:h-9"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <div className="bg-surface-secondary size-14 min-w-14 rounded-full text-center sm:size-20 sm:min-w-20" />
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                  {[...Array(4)].map((_, idx) => (
                    <div className="relative" key={idx}>
                      <Skeleton className="bg-surface-secondary h-32 w-full rounded-xl sm:h-44 lg:h-60" />
                      <Skeleton className="bg-surface-secondary absolute bottom-2 left-2 h-5 w-10 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : photographerItems.length <= 0 ? (
            <EmptyState
              title="No ranked photographers yet"
              description="There are no ranked photographers available for this contest right now."
            />
          ) : (
            photographerItems?.map((rankPhotographer: any, index: number) => {
              const progress = Math.max(
                ((rankPhotographer?.totalVotes ?? 0) /
                  (rankPhotographersDataPage?.data?.contestTotalVotes ?? 1)) *
                  100,
                10,
              );

              const handleUserClick = () => {
                const rankProfileIdentifier =
                  rankPhotographer?.user?.username || rankPhotographer?.user?.id || '';
                if (rankProfileIdentifier) {
                  router.push(`/profile/${rankProfileIdentifier}`);
                }
              };

              return (
                <div className="space-y-4" key={index}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                    <div
                      className="flex min-w-0 cursor-pointer items-center gap-3 sm:w-2/5 lg:w-1/3"
                      onClick={handleUserClick}
                    >
                      {rankPhotographer?.user?.avatar ? (
                        <Image
                          src={rankPhotographer.user.avatar}
                          alt=""
                          width={96}
                          height={96}
                          className="bg-surface-secondary size-14 min-w-14 rounded-full object-cover sm:size-20 sm:min-w-20"
                        />
                      ) : (
                        <div className="bg-surface-secondary size-14 min-w-14 rounded-full sm:size-20 sm:min-w-20" />
                      )}
                      <div className="min-w-0">
                        <h3 className="hover:text-primary truncate text-base font-semibold sm:text-lg">
                          {rankPhotographer?.user?.fullName}
                        </h3>
                        <p className="text-muted-foreground truncate text-xs sm:text-sm">
                          {rankPhotographer?.user?.location ?? ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full min-w-0 items-center">
                      <div className="bg-border -mr-4 flex h-10 min-w-0 flex-1 items-center justify-end rounded-l-full px-2 sm:-mr-5 sm:h-12">
                        <div
                          className={cn(
                            'bg-primary text-primary-foreground flex h-8 max-w-full items-center rounded-l-full px-3 text-sm whitespace-nowrap sm:h-9 sm:text-base',
                          )}
                          style={{ width: `${progress}%` }}
                        >
                          {rankPhotographer?.totalVotes} Votes
                        </div>
                      </div>
                      <div className="bg-primary text-primary-foreground flex size-14 min-w-14 items-center justify-center rounded-full text-lg font-bold shadow sm:size-20 sm:min-w-20 sm:text-2xl">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                    {[...(rankPhotographer.photos ?? [])]
                      .filter((photo: any) => photo?.url)
                      .sort((a, b) => b?.voteCount - a?.voteCount)
                      .map((photo: any, index: any) => {
                        const handlePhotoClick = () => {
                          const photosToSet = rankPhotographer.photos.map((p: any) => ({
                            id: p?.userPhotoId ?? p?.photo?.id ?? p?.id,
                            url: p?.url ?? p?.photo?.url ?? null,
                            userId: rankPhotographer.user?.id,
                            title: p?.title ?? p?.photo?.title ?? '',
                            views: 0,
                            likes: 0,
                            totalVotes: p?.voteCount ?? 0,
                          }));
                          dispatch(setSwiperPhotos(photosToSet));
                          const targetId = photo?.userPhotoId ?? photo?.photo?.id ?? photo?.id;
                          router.push(
                            `/photo/${targetId}?source=contest&contest=${id}&ownerId=${rankPhotographer.user?.id}`,
                          );
                        };

                        return (
                          <div
                            className="relative cursor-pointer"
                            key={index}
                            onClick={handlePhotoClick}
                          >
                            <Image
                              src={photo.url}
                              alt=""
                              width={400}
                              height={280}
                              className="h-32 w-full rounded-xl object-cover sm:h-44 lg:h-60"
                            />

                            <div className="bg-overlay absolute bottom-2 left-2 flex items-center gap-1 rounded px-2 py-1 text-sm">
                              <MdOutlineHowToVote />
                              {photo?.voteCount}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={photographerLoadMoreRef}>
            {activeRankTab === 'top-photographer' &&
              rankPhotographersHasMore &&
              isRankPhotographerFetching && (
                <div className="space-y-16 pt-4">
                  {[50, 30].map((value, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                        <div className="flex items-center gap-3 sm:w-2/5 lg:w-1/3">
                          <Skeleton className="bg-surface-secondary size-14 rounded-full sm:size-20" />
                          <div className="min-w-0 space-y-1">
                            <Skeleton className="bg-surface-secondary h-5 w-32 rounded" />
                            <Skeleton className="bg-surface-secondary h-4 w-20 rounded" />
                          </div>
                        </div>
                        <div className="flex w-full min-w-0 items-center">
                          <div className="bg-border -mr-4 flex h-10 min-w-0 flex-1 items-center justify-end rounded-l-full px-2 sm:-mr-5 sm:h-12">
                            <Skeleton
                              className="bg-surface-secondary h-8 max-w-full rounded-l-full sm:h-9"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <div className="bg-surface-secondary size-14 min-w-14 rounded-full text-center sm:size-20 sm:min-w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};

export default RankTab;

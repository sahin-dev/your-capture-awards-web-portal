'use client';

import { useAuth } from '@/hooks/useAuth';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useLazyGetFollowingsQuery, useToggleFollowMutation } from '@/store/apis/socialApi';
import { cn } from '@/utils/cn';
import { Loader2, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PeopleLoadingState, TabErrorState, TabSectionHeader } from './public-tab-ui';

type Props = {
  username: string;
  userId?: string;
  isOwn?: boolean;
};

function PersonCard({ item }: { item: any }) {
  const followingUser = item.following;
  const followingId = followingUser?.id || item.followingId;
  const { user: currentUser } = useAuth();
  const [toggleFollow, { isLoading: isToggling }] = useToggleFollowMutation();
  const [following, setFollowing] = useState(true);

  const isMe = followingId === currentUser?.id;

  const handleFollowToggle = async () => {
    try {
      const res = await toggleFollow({ userId: followingId }).unwrap();
      if (res.success) {
        setFollowing((prev: boolean) => !prev);
      }
    } catch (err: any) {}
  };

  const name =
    followingUser?.fullName ||
    (followingUser?.firstName && followingUser?.lastName
      ? `${followingUser.firstName} ${followingUser.lastName}`
      : '') ||
    'User';
  const avatar = followingUser?.avatar || '';
  const country = followingUser?.location || followingUser?.country || '';
  const cover =
    item.cover ??
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="border-border/80 bg-surface/40 overflow-hidden rounded-lg border shadow-lg backdrop-blur-xs">
      {/* Banner */}
      <div className="bg-surface-secondary relative h-24">
        <Image src={cover} alt={`${name} cover`} fill className="object-cover" />

        {/* Banner bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
      </div>

      {/* Move content UP */}
      <div className="relative z-20 -mt-6 px-4 pb-4">
        <div className="flex items-center gap-3">
          {isMe ? (
            <div className="border-border bg-surface relative z-30 size-16 shrink-0 overflow-hidden rounded-full border-2 shadow-md">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name}
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              ) : (
                <div className="bg-surface-secondary text-caption-foreground flex size-full items-center justify-center text-[10px] font-bold">
                  NO AVATAR
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/profile/${followingId}`}
              className="border-border bg-surface relative z-30 size-16 shrink-0 overflow-hidden rounded-full border-2 shadow-md transition hover:opacity-80"
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name}
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              ) : (
                <div className="bg-surface-secondary text-caption-foreground flex size-full items-center justify-center text-[10px] font-bold">
                  NO AVATAR
                </div>
              )}
            </Link>
          )}

          <div className="min-w-0 flex-1 pt-2">
            {isMe ? (
              <span className="text-foreground block truncate font-semibold">{name}</span>
            ) : (
              <Link
                href={`/profile/${followingId}`}
                className="hover:text-primary text-foreground block truncate font-semibold transition"
              >
                {name}
              </Link>
            )}

            {country && (
              <p className="text-caption-foreground mt-0.5 flex items-center gap-1 truncate text-xs">
                <MapPin size={14} className="shrink-0" /> {country}
              </p>
            )}
          </div>
        </div>

        {!isMe && (
          <button
            type="button"
            onClick={handleFollowToggle}
            disabled={isToggling}
            className={cn(
              'mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-sm py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-80',
              following
                ? 'bg-surface-secondary text-foreground hover:bg-surface-secondary'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground',
            )}
          >
            {isToggling ? (
              <Loader2 className="text-foreground size-4 animate-spin" />
            ) : following ? (
              'Following'
            ) : (
              'Follow'
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const FollowingTabContent = ({ username, userId, isOwn = false }: Props) => {
  const [people, setPeople] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const [triggerGetFollowings, { isFetching }] = useLazyGetFollowingsQuery();

  useEffect(() => {
    const requestVersion = ++requestVersionRef.current;
    let active = true;
    setPeople([]);
    setPage(1);
    setHasMore(true);
    setError(null);

    const fetchInitial = async () => {
      try {
        const res = await triggerGetFollowings({
          userId: isOwn ? undefined : userId,
          page: 1,
          limit: 12,
        }).unwrap();

        if (active && requestVersion === requestVersionRef.current) {
          if (res.success) {
            setPeople(res.data || []);
            setHasMore(res.meta?.hasNextPage ?? false);
            setPage(2);
          } else {
            setError(res.message || 'Failed to load following list.');
          }
        }
      } catch (err: any) {
        if (active && requestVersion === requestVersionRef.current) {
          setError(err?.data?.message || err?.message || 'Failed to load following list.');
        }
      }
    };

    fetchInitial();

    return () => {
      active = false;
    };
  }, [userId, isOwn, triggerGetFollowings]);

  const loadMore = async () => {
    if (isFetching || !hasMore) return;
    const requestVersion = requestVersionRef.current;
    try {
      const res = await triggerGetFollowings({
        userId: isOwn ? undefined : userId,
        page,
        limit: 12,
      }).unwrap();

      if (res.success && requestVersion === requestVersionRef.current) {
        setPeople((current) => {
          const ids = new Set(current.map((person) => person.id));
          return [...current, ...(res.data || []).filter((person: any) => !ids.has(person.id))];
        });
        setHasMore(res.meta?.hasNextPage ?? false);
        setPage((prev) => prev + 1);
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Unable to load more following.');
    }
  };

  const { loadMoreRef } = useInfiniteScroll({
    hasMore: hasMore && page > 1,
    isLoading: isFetching,
    onLoadMore: loadMore,
  });

  return (
    <section className="container py-6">
      <TabSectionHeader title="Following" />
      {error ? <TabErrorState title="Unable to load following list" description={error} /> : null}
      {people.length === 0 && isFetching && page === 1 ? (
        <PeopleLoadingState count={4} />
      ) : (
        <>
          {people.length === 0 && !isFetching ? (
            <div className="text-caption-foreground py-12 text-center">
              Not following anyone yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {people.map((item) => (
                <PersonCard key={item.id} item={item} />
              ))}
            </div>
          )}
          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="flex justify-center py-6">
            {isFetching && page > 1 && (
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default FollowingTabContent;

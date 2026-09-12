'use client';

import { cn } from '@/utils/cn';
import { AlertTriangle, Loader2, MapPin, Vote } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AchievementsTabContent from './AchievementsTabContent';
import FollowersTabContent from './FollowersTabContent';
import FollowingTabContent from './FollowingTabContent';
import LikeTabContent from './LikeTabContent';
import PhotosTabContent from './PhotosTabContent';

import { useAuth } from '@/hooks/useAuth';
import {
  useGetOtherUserPhotosQuery,
  useGetOtherUserProfileQuery,
  useGetOtherUserStatsQuery,
  useGetPhotosQuery,
  useGetStatsQuery,
} from '@/store/apis/profileApi';

import { useToggleFollowMutation } from '@/store/apis/socialApi';
import { useGetMyTeamQuery } from '@/store/apis/teamApi';
import AddCoverDialog from '../profile/AddCoverDialog';
import AvatarDialog from '../profile/AvatarDialog';

type Props = {
  isOwn?: boolean;
  userId?: string;
};

type TabKey = 'photos' | 'likes' | 'achievements' | 'followers' | 'following';

type TabConfig = {
  key: TabKey;
  label: string;
  value: number;
};

function TabButton({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex h-full flex-1 cursor-pointer flex-col items-center justify-center px-5 transition duration-200 outline-none select-none',
        active
          ? 'bg-primary text-primary-foreground font-bold'
          : 'text-muted-foreground hover:bg-surface-secondary hover:text-foreground',
      )}
    >
      <span className="text-sm leading-tight">{value.toLocaleString()}</span>
      <span className="text-[10px] font-semibold tracking-wider whitespace-nowrap uppercase">
        {label}
      </span>
    </button>
  );
}

function ProfileContent({
  activeTab,
  profile,
  isOwn,
  userId,
  photos,
  isLoading,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: {
  activeTab: TabKey;
  profile: any;
  isOwn: boolean;
  userId?: string;
  photos: any[];
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  const username = profile?.username || profile?.id || '';
  // Track which tabs have been visited so we only mount them once.
  const [visitedTabs, setVisitedTabs] = useState<Set<TabKey>>(new Set([activeTab]));

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const ALL_TABS: TabKey[] = ['photos', 'likes', 'achievements', 'followers', 'following'];

  return (
    <>
      {ALL_TABS.map((tab) => {
        if (!visitedTabs.has(tab)) return null;
        return (
          <div key={tab} className={tab === activeTab ? 'block' : 'hidden'}>
            {tab === 'achievements' && <AchievementsTabContent username={username} isOwn={isOwn} />}
            {tab === 'followers' && (
              <FollowersTabContent username={username} userId={profile?.id} isOwn={isOwn} />
            )}
            {tab === 'following' && (
              <FollowingTabContent username={username} userId={profile?.id} isOwn={isOwn} />
            )}
            {tab === 'likes' && (
              <LikeTabContent username={username} userId={profile?.id} isOwn={isOwn} />
            )}
            {tab === 'photos' && (
              <PhotosTabContent
                username={username}
                isOwn={isOwn}
                photos={photos}
                isLoading={isLoading}
                userId={userId}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={onLoadMore}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function PublicProfilePage({ isOwn = false, userId }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('photos');
  const [isFollowing, setIsFollowing] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [photoPage, setPhotoPage] = useState(1);
  const [photoItems, setPhotoItems] = useState<any[]>([]);

  const { user: currentUser, isAuthenticated } = useAuth();
  const targetUserId = isOwn ? currentUser?.id : userId;

  // Used to decide whether the joined-team link below should go to the viewer's own
  // team home (they're a member) or the public team page (they're not).
  const { data: myTeamData } = useGetMyTeamQuery(undefined, { skip: !isAuthenticated });
  const myTeamId = myTeamData?.data?.team?.id;

  // 1. Fetch Stats and Photos for Own Profile
  const { data: ownStatsData, isLoading: isOwnStatsLoading } = useGetStatsQuery(undefined, {
    skip: !isOwn,
  });
  const {
    data: ownPhotosData,
    isLoading: isOwnPhotosLoading,
    isFetching: isOwnPhotosFetching,
  } = useGetPhotosQuery({ page: photoPage, limit: 20 }, {
    skip: !isOwn,
  });

  // 2. Fetch Profile, Stats and Photos for Other User Profile
  const {
    data: otherProfileData,
    isLoading: isOtherProfileLoading,
    isError: isOtherProfileError,
    error: otherProfileError,
    refetch: refetchOtherProfile,
  } = useGetOtherUserProfileQuery(targetUserId || '', {
    skip: isOwn || !targetUserId,
  });
  const { data: otherStatsData, isLoading: isOtherStatsLoading } = useGetOtherUserStatsQuery(
    targetUserId || '',
    {
      skip: isOwn || !targetUserId,
    },
  );
  const {
    data: otherPhotosData,
    isLoading: isOtherPhotosLoading,
    isFetching: isOtherPhotosFetching,
  } = useGetOtherUserPhotosQuery(
    { id: targetUserId || '', page: photoPage, limit: 20 },
    { skip: isOwn || !targetUserId },
  );

  // 3. Resolve active data
  const profile = isOwn ? currentUser : (otherProfileData?.data ?? null);
  const stats = isOwn ? ownStatsData?.data : otherStatsData?.data;
  const photoResponse = isOwn ? ownPhotosData : otherPhotosData;
  const responsePhotos = useMemo(
    () =>
      photoResponse
        ? Array.isArray(photoResponse.data)
          ? photoResponse.data
          : (photoResponse.data.photos ?? [])
        : [],
    [photoResponse],
  );
  const photoMeta = photoResponse?.meta;
  const photos = photoItems;
  const isPhotosFetching = isOwn ? isOwnPhotosFetching : isOtherPhotosFetching;

  useEffect(() => {
    setPhotoPage(1);
    setPhotoItems([]);
  }, [isOwn, targetUserId]);

  useEffect(() => {
    if (!photoResponse) return;
    setPhotoItems((current) => {
      if (photoPage === 1) return responsePhotos;
      const ids = new Set(current.map((photo) => photo.id));
      return [...current, ...responsePhotos.filter((photo) => !ids.has(photo.id))];
    });
  }, [photoPage, photoResponse, responsePhotos]);

  const currentUserId = (currentUser as any)?.id || (currentUser as any)?._id;
  const currentUsername = (currentUser as any)?.username;
  const profileUserId = profile?.id || profile?._id || profile?.userId;
  const profileUsername = profile?.username;
  const isRouteCurrentUser =
    !isOwn &&
    Boolean(
      (currentUserId && userId === currentUserId) ||
        (currentUsername && userId === currentUsername),
    );
  const isCurrentUserProfile =
    isOwn ||
    isRouteCurrentUser ||
    Boolean(
      (currentUserId && profileUserId && currentUserId === profileUserId) ||
        (currentUsername && profileUsername && currentUsername === profileUsername),
    );

  // Resolved joined team: for own profile from currentUser, for public from API data
  const joinedTeam = (profile as any)?.joinedTeam ?? null;

  const showProfileError =
    !isOwn && !isOtherProfileLoading && (isOtherProfileError || !otherProfileData?.data);

  const errorMessage =
    (otherProfileError as any)?.data?.message ||
    (otherProfileError as any)?.message ||
    'This user profile could not be found. Please check the link or try again later.';

  const isLoading = isOwn
    ? isOwnStatsLoading || isOwnPhotosLoading
    : isOtherProfileLoading || isOtherStatsLoading || isOtherPhotosLoading;

  // Sync follow state from API (isFollowed is in otherProfileData.data)
  useEffect(() => {
    const isFollowedFromApi = otherProfileData?.data?.isFollowed;
    if (!isCurrentUserProfile && isFollowedFromApi !== undefined) {
      setIsFollowing(isFollowedFromApi);
    }
  }, [otherProfileData?.data?.isFollowed, isCurrentUserProfile]);

  const [toggleFollow, { isLoading: isFollowToggling }] = useToggleFollowMutation();
  const targetMongoId = profile?.id;

  const handleToggleFollow = async () => {
    if (!targetMongoId || isCurrentUserProfile) return;
    try {
      const res = await toggleFollow({ userId: targetMongoId }).unwrap();
      if (res.success) {
        setIsFollowing((prev) => !prev);
      }
    } catch (err: any) {}
  };

  const fullName =
    profile?.fullName ||
    (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : '') ||
    profile?.name ||
    'Name not found';

  // Votes this user's photos received across every contest they participated in.
  const totalVotes = useMemo(
    () => (stats as any)?.totalVotes ?? (profile as any)?.totalVotes ?? 0,
    [stats, profile],
  );

  const tabs = useMemo(() => {
    const list: TabConfig[] = [
      {
        key: 'photos' as const,
        label: 'Photos',
        value: (stats as any)?.userPhotos || (stats as any)?.photosCount || photos.length || 0,
      },
    ];

    if (isOwn) {
      list.push({ key: 'likes' as const, label: 'Likes', value: (stats as any)?.likes || 0 });
    }

    list.push(
      {
        key: 'achievements' as const,
        label: 'Achievements',
        value: (stats as any)?.achievements || 0,
      },
      {
        key: 'followers' as const,
        label: 'Followers',
        value: (stats as any)?.followers || (stats as any)?.follower || 0,
      },
      {
        key: 'following' as const,
        label: 'Following',
        value: (stats as any)?.followings || (stats as any)?.following || 0,
      },
    );

    return list;
  }, [isOwn, stats, photos.length]);

  const router = useRouter();

  if (showProfileError) {
    return (
      <main className="margin bg-background text-foreground min-h-screen">
        <section className="container py-20">
          <div className="mx-auto max-w-xl rounded-3xl p-10 text-center shadow-sm">
            <AlertTriangle className="text-destructive mx-auto mb-4 size-12" />
            <h1 className="text-foreground text-2xl font-semibold">Profile not found</h1>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 rounded-md px-5 py-2 text-sm font-semibold transition"
            >
              Go home
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="margin bg-background text-foreground min-h-screen">
      {/* Banner */}
      <section className="bg-surface relative h-60 w-full overflow-hidden md:h-96">
        {isLoading && !profile ? (
          <div className="bg-surface-secondary/60 size-full animate-pulse" />
        ) : !coverError && profile?.cover ? (
          <Image
            src={profile.cover}
            alt={`${fullName} cover`}
            width={2000}
            height={384}
            priority
            className="size-full object-cover opacity-80"
            onError={() => setCoverError(true)}
          />
        ) : (
          <div className="bg-surface text-muted-foreground flex h-full w-full items-center justify-center">
            <p>No cover photo</p>
          </div>
        )}
        {isOwn && (
          <div className="absolute top-5 right-5 z-20">
            <AddCoverDialog />
          </div>
        )}
        <div className="from-background via-background/20 absolute inset-0 bg-linear-to-t to-transparent" />
      </section>

      {/* Profile Header Bar */}
      <section className="border-border bg-surface/60 relative z-10 border-b backdrop-blur-md">
        <div className="container py-2">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            {/* Left/Center Group: Avatar, Info, Team, Follow Button */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="relative -mt-20 shrink-0">
                {isLoading && !profile ? (
                  <div className="border-background bg-surface-secondary size-28 animate-pulse rounded-full border-4 sm:size-34" />
                ) : isOwn ? (
                  <div className="group/avatar border-background bg-surface-secondary relative size-28 overflow-hidden rounded-full border-4 object-cover shadow-2xl sm:size-34">
                    <AvatarDialog />
                  </div>
                ) : (
                  <div className="border-background bg-surface-secondary relative size-28 overflow-hidden rounded-full border-4 shadow-2xl sm:size-34">
                    {!avatarError && profile?.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt={fullName}
                        fill
                        className="object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
                        No Avatar
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2"></div>
              {/* User Details Group */}
              <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
                {/* Name, Location, Votes stacked in Column */}
                {isLoading && !profile ? (
                  <div className="flex shrink-0 flex-col justify-center gap-2">
                    <div className="bg-surface-secondary h-6 w-36 animate-pulse rounded" />
                    <div className="bg-surface-secondary h-4 w-24 animate-pulse rounded" />
                  </div>
                ) : (
                  <div className="flex shrink-0 flex-col justify-center">
                    <h1 className="text-foreground mb-1.5 leading-tight font-bold tracking-tight sm:text-lg">
                      {fullName}
                    </h1>
                    {(profile?.location || profile?.country) && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                          <MapPin className="text-muted-foreground size-3.5" />
                          {profile?.location || profile?.country}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Vertical Divider 1 */}
                {/* Team Group — from API joinedTeam, with conditional divider */}
                {isLoading && !profile ? (
                  <>
                    <div className="bg-border hidden h-10 w-px shrink-0 self-center sm:block" />
                    <div className="flex animate-pulse items-center gap-2.5">
                      <div className="bg-surface-secondary size-10 rounded-full" />
                      <div className="bg-surface-secondary h-4 w-20 rounded" />
                    </div>
                  </>
                ) : joinedTeam?.team ? (
                  <>
                    <div className="bg-border hidden h-10 w-px shrink-0 self-center sm:block" />
                    <a
                      href={
                        myTeamId && myTeamId === joinedTeam.team.id
                          ? '/teams/home'
                          : `/teams/${joinedTeam.team.id || joinedTeam.team.slug || ''}`
                      }
                      className="group/team flex shrink-0 cursor-pointer items-center gap-2.5 self-center transition hover:opacity-80"
                    >
                      {joinedTeam.team.badge ? (
                        <Image
                          src={joinedTeam.team.badge}
                          alt={joinedTeam.team.name}
                          width={40}
                          height={40}
                          className="border-border bg-surface-secondary group-hover/team:border-border-strong size-10 rounded-full border object-cover transition"
                        />
                      ) : (
                        <div className="border-border bg-surface-secondary text-foreground group-hover/team:border-border-strong flex size-10 items-center justify-center rounded-full border text-xs font-bold transition">
                          {joinedTeam.team.name?.slice(0, 2).toUpperCase() || 'T'}
                        </div>
                      )}
                      <span className="text-foreground group-hover/team:text-foreground text-sm font-semibold transition">
                        {joinedTeam.team.name}
                      </span>
                    </a>
                  </>
                ) : null}

                {/* Follow Button — public profile only, with conditional divider */}
                {isLoading && !profile ? (
                  !isCurrentUserProfile && (
                    <>
                      <div className="bg-border hidden h-10 w-px shrink-0 self-center sm:block" />
                      <div className="bg-surface-secondary h-8 w-20 animate-pulse rounded" />
                    </>
                  )
                ) : !isCurrentUserProfile ? (
                  <>
                    <div className="bg-surface-secondary/50 hidden h-10 w-px shrink-0 self-center sm:block" />
                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      disabled={isFollowToggling}
                      className={cn(
                        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 self-center rounded-sm px-5 py-2 text-xs font-semibold transition select-none disabled:cursor-wait disabled:opacity-80',
                        isFollowing
                          ? 'bg-surface-secondary text-foreground hover:bg-surface-tertiary'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground',
                      )}
                    >
                      {isFollowToggling ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : isFollowing ? (
                        'Following'
                      ) : (
                        'Follow'
                      )}
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {/* Right side: Total votes + Scrollable Modern Tabs Box */}
            <div className="flex w-full items-center gap-3 overflow-hidden lg:w-auto">
              {/* Total votes received across all participated contests */}
              {isLoading && !stats ? (
                <div className="border-border bg-surface/30 flex h-12 shrink-0 animate-pulse items-center gap-2.5 rounded-sm border px-4 shadow-md">
                  <div className="bg-surface-secondary size-5 rounded" />
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-surface-secondary h-4 w-10 rounded" />
                    <div className="bg-surface-secondary h-2 w-16 rounded" />
                  </div>
                </div>
              ) : (
                <div
                  title="Total votes received across all contests"
                  className="border-border bg-surface/30 flex h-12 shrink-0 items-center gap-2.5 rounded-sm border px-4 shadow-md"
                >
                  <Vote className="text-primary size-5 shrink-0" />
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-foreground text-sm leading-tight font-bold">
                      {Number(totalVotes).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wider whitespace-nowrap uppercase">
                      Total Votes
                    </span>
                  </div>
                </div>
              )}

              <div className="divide-border border-border bg-surface/30 flex h-12 items-center divide-x overflow-x-auto rounded-sm border shadow-md">
                {isLoading && !stats
                  ? Array.from({ length: isOwn ? 5 : 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex h-full flex-1 animate-pulse flex-col items-center justify-center gap-1.5 px-5 whitespace-nowrap"
                      >
                        <div className="bg-surface-secondary h-4 w-8 rounded" />
                        <div className="bg-surface-secondary h-2 w-12 rounded" />
                      </div>
                    ))
                  : tabs.map((tab) => (
                      <TabButton
                        key={tab.key}
                        label={tab.label}
                        value={tab.value}
                        active={activeTab === tab.key}
                        onClick={() => setActiveTab(tab.key)}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <ProfileContent
        activeTab={activeTab}
        profile={profile}
        isOwn={isOwn}
        userId={userId}
        photos={photos}
        isLoading={isLoading}
        hasMore={photoMeta?.hasNextPage ?? false}
        isLoadingMore={isPhotosFetching && photoItems.length > 0}
        onLoadMore={() => {
          if (photoMeta?.hasNextPage && !isPhotosFetching) setPhotoPage((page) => page + 1);
        }}
      />
    </main>
  );
}

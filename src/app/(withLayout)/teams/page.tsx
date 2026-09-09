'use client';

import { BarChartBig, Languages, MapPin, Search, Trophy, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/scrollbar';
import { FreeMode, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import SwitchTeamDialog from '@/components/module/team/SwitchTeamDialog';
import TeamMembershipLoading from '@/components/module/team/TeamMembershipLoading';
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useTeamMembership } from '@/hooks/useTeamMembership';
import { useGetAllLevelsQuery, useGetUserProgressQuery } from '@/store/apis/levelsApi';
import {
  useGetSuggestedTeamsQuery,
  useGetTeamsQuery,
  useJoinTeamMutation,
  useSwitchTeamMutation,
} from '@/store/apis/teamApi';
import type { PaginationMeta, TeamListItem, TeamUserSummary } from '@/store/types/teamTypes';
import { getErrorMessage, showErrorToast } from '@/utils/team-feedback';

const PAGE_SIZE = 8;
const FEATURED_LIMIT = 8;
const TEAM_BANNER_PLACEHOLDER = '/images/team.jpg';

const EMPTY_META: PaginationMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPage: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

function getUserName(user?: TeamUserSummary) {
  if (!user) return 'Team member';

  return (
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    'Team member'
  );
}

function formatSkillLabel(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getTeamBanner(team: TeamListItem) {
  return team.badge || TEAM_BANNER_PLACEHOLDER;
}

function getTeamAvatars(team: TeamListItem) {
  const members = team.members?.map((member) => member.member).filter(Boolean) ?? [];

  if (members.length > 0) {
    return members.slice(0, 4);
  }

  return team.creator ? [team.creator] : [];
}

function JoinTeamButton({
  teamId,
  teamName,
  minRequirement,
  className,
}: {
  teamId: string;
  teamName: string;
  minRequirement?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [joinTeam, { isLoading: isJoining }] = useJoinTeamMutation();
  const [switchTeam, { isLoading: isSwitching }] = useSwitchTeamMutation();
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const { data: levelsData } = useGetAllLevelsQuery(
    { page: 1, limit: 50 },
    { skip: !isAuthenticated },
  );
  const { data: progressData } = useGetUserProgressQuery(undefined, { skip: !isAuthenticated });
  const userLevelOrder = progressData?.data?.currentStatus?.order ?? 0;
  const teamLevels = levelsData?.data ?? [];
  const requiredLevelOrder =
    teamLevels.find((level) => level.levelName === minRequirement)?.order ?? 0;
  const isLoading = isJoining || isSwitching;

  const handleJoin = async () => {
    if (isLoading) return;

    try {
      if (isAuthenticated && requiredLevelOrder > 0 && userLevelOrder > 0) {
        if (userLevelOrder < requiredLevelOrder) {
          showErrorToast(null, 'Your level does not meet this team minimum requirement');
          return;
        }
      }

      await joinTeam(teamId).unwrap();
      router.replace('/teams/home');
    } catch (error) {
      if (getErrorMessage(error, '').toLowerCase().includes('already joined a team')) {
        setSwitchDialogOpen(true);
        return;
      }
      showErrorToast(error, 'Failed to join team');
    }
  };

  const handleSwitch = async () => {
    try {
      await switchTeam(teamId).unwrap();
      setSwitchDialogOpen(false);
      router.replace('/teams/home');
    } catch (error) {
      showErrorToast(error, 'Failed to switch team');
    }
  };

  return (
    <>
      <Button type="button" onClick={handleJoin} disabled={isLoading} className={className}>
        {isJoining ? 'Joining...' : 'Join'}
      </Button>
      <SwitchTeamDialog
        open={switchDialogOpen}
        onClose={() => setSwitchDialogOpen(false)}
        currentTeamName={user?.joinedTeam?.team?.name || 'your current team'}
        newTeamName={teamName}
        isSubmitting={isSwitching}
        onConfirm={handleSwitch}
      />
    </>
  );
}

function TeamCardSkeleton() {
  return (
    <article className="border-border rounded-xl border bg-transparent p-4">
      <div className="flex items-start gap-3">
        <div className="bg-surface-secondary relative size-12 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="bg-surface-secondary h-4 w-36 rounded" />
          <div className="bg-surface-secondary h-3 w-full rounded" />
          <div className="bg-surface-secondary h-3 w-4/5 rounded" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="bg-surface-secondary h-8 rounded" />
        <div className="bg-surface-secondary h-8 rounded" />
        <div className="bg-surface-secondary h-8 rounded" />
        <div className="bg-surface-secondary h-8 rounded" />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <div className="bg-surface-secondary h-9 w-20 rounded-md" />
        <div className="bg-surface-secondary h-9 w-20 rounded-md" />
      </div>
    </article>
  );
}

// function FeaturedTeamCard({ team }: { team: TeamListItem }) {
//   const avatars = getTeamAvatars(team);

//   return (
//     <article className="border-border hover:border-primary/40 h-full overflow-hidden rounded-md border bg-transparent p-3 transition duration-200">
//       <div className="border-border flex items-start justify-between gap-3 border-b pb-3">
//         <div className="flex min-w-0 items-start gap-3">
//           <div className="border-border bg-surface-secondary relative size-11 shrink-0 overflow-hidden rounded-full border">
//             <Image
//               src={getTeamBanner(team)}
//               alt={team.name}
//               fill
//               className="object-cover"
//               sizes="44px"
//             />
//           </div>

//           <div className="min-w-0 pt-0.5">
//             <h3 className="truncate text-[15px] leading-5 font-semibold text-balance">
//               {team.name}
//             </h3>
//             <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
//               <span className="text-primary inline-flex items-center gap-1 font-semibold">
//                 <Users className="size-3.5" />
//                 {team.member_count}
//               </span>
//               <span className="text-primary inline-flex items-center gap-1 font-semibold">
//                 <MapPin className="size-3.5" />
//                 {team.country}
//               </span>
//               <span className="text-muted-foreground inline-flex items-center gap-1 font-medium">
//                 <Trophy className="text-primary-soft-foreground size-3.5" />
//                 {team.score.toLocaleString()}
//               </span>
//             </div>
//           </div>
//         </div>

//         <button
//           type="button"
//           className="text-muted-foreground hover:text-foreground rounded-full p-1 transition"
//           aria-label={`Close ${team.name}`}
//         >
//           <X className="size-4" />
//         </button>
//       </div>

//       <div className="relative px-1 py-3">
//         <div className="flex items-center justify-center gap-2">
//           <AvatarGroup className="justify-center">
//             {avatars.map((user, avatarIndex) => (
//               <Avatar key={`${team.id}-${avatarIndex}`} size="sm" className="border-border border">
//                 {user.avatar ? <AvatarImage src={user.avatar} alt={getUserName(user)} /> : null}
//                 <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
//                   {getInitials(getUserName(user))}
//                 </AvatarFallback>
//               </Avatar>
//             ))}
//           </AvatarGroup>
//           <span className="text-muted-foreground text-xs font-medium">
//             {avatars.length ? `${avatars.length}` : team.member_count}
//           </span>
//         </div>
//       </div>

//       <p className="text-muted-foreground border-border min-h-22 border-t pt-3 text-sm leading-6">
//         {team.description}
//       </p>

//       <div className="mt-3 flex gap-2">
//         <Button
//           asChild
//           variant="outline"
//           className="border-border bg-surface-secondary/70 text-primary h-10 flex-1"
//         >
//           <Link href={`/teams/${team.id}`}>View Team</Link>
//         </Button>
//         <JoinTeamButton
//           teamId={team.id}
//           minRequirement={team.min_requirement}
//           className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 flex-1"
//         />
//       </div>
//     </article>
//   );
// }

function MoreTeamCard({ team }: { team: TeamListItem }) {
  return (
    <article className="border-border rounded-xl border p-4 transition duration-200">
      <div className="flex items-start gap-3">
        <div className="border-border bg-surface-secondary relative size-14 shrink-0 overflow-hidden rounded-full border">
          <Image
            src={getTeamBanner(team)}
            alt={team.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>

        <div className="mt-1 min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-balance">{team.name}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">{team.description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="border-border bg-surface-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
          <Languages size={12} />
          {team.language}
        </span>
        <span className="border-border bg-surface-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
          <MapPin size={12} />
          {team.country}
        </span>
        <span className="border-border bg-surface-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
          <BarChartBig size={12} />{' '}
          {team.min_requirement ? formatSkillLabel(team.min_requirement_str) : 'N/A'}
        </span>
        <span className="border-border bg-surface-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
          <Users size={12} /> {team.member_count}/{team.member_slots}
        </span>
        <span className="border-border bg-surface-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
          <Trophy size={12} /> {team.score.toLocaleString()}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <Button asChild variant="secondary" className="flex-1 px-3">
          <Link href={`/teams/${team.id}`}>View</Link>
        </Button>
        <JoinTeamButton
          teamId={team.id}
          teamName={team.name}
          minRequirement={team.min_requirement}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 px-3"
        />
      </div>
    </article>
  );
}

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [allTeams, setAllTeams] = useState<TeamListItem[]>([]);
  const deferredSearch = useDeferredValue(searchQuery.trim());
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isCheckingMembership, hasTeam } = useTeamMembership();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setPage(1);
    setAllTeams([]);
  }, [deferredSearch]);

  useEffect(() => {
    if (!isMounted || isCheckingMembership) return;
    if (hasTeam) {
      router.replace('/teams/home');
    }
  }, [hasTeam, isCheckingMembership, router, isMounted]);

  const skipListing = !isMounted || (isAuthenticated && (isCheckingMembership || hasTeam));

  const teamsQuery = useGetTeamsQuery(
    {
      page,
      limit: PAGE_SIZE,
      search: deferredSearch || undefined,
    },
    { skip: skipListing },
  );

  const suggestedQuery = useGetSuggestedTeamsQuery(
    {
      page: 1,
      limit: FEATURED_LIMIT,
    },
    { skip: skipListing },
  );

  const teams = teamsQuery.data?.data ?? [];
  const suggestedTeams = suggestedQuery.data?.data ?? [];
  const meta = teamsQuery.data?.meta ?? EMPTY_META;
  const featuredTeams = suggestedTeams.slice(0, 4);

  const isSearching = deferredSearch.length > 0;
  const hasResults = allTeams.length > 0;
  const showInitialSkeleton = (teamsQuery.isLoading || teamsQuery.isFetching) && !hasResults;

  useEffect(() => {
    if (!teamsQuery.data) return;

    setAllTeams((prevTeams) => {
      if (meta.page <= 1) {
        return teams;
      }

      const seenIds = new Set(prevTeams.map((team) => team.id));
      const nextTeams = teams.filter((team) => !seenIds.has(team.id));
      return [...prevTeams, ...nextTeams];
    });
  }, [teamsQuery.data, teams, meta.page]);

  const loadMore = useCallback(() => {
    if (meta.hasNextPage && !teamsQuery.isFetching) {
      setPage((currentPage) => currentPage + 1);
    }
  }, [meta.hasNextPage, teamsQuery.isFetching]);

  const { loadMoreRef } = useInfiniteScroll({
    hasMore: meta.hasNextPage,
    isLoading: teamsQuery.isFetching,
    onLoadMore: loadMore,
  });

  if (skipListing) {
    return <TeamMembershipLoading />;
  }

  return (
    <main className="margin relative isolate container overflow-hidden py-6 sm:py-8 lg:py-10">
      <div className="relative space-y-8">
        {/* {featuredTeams.length > 0 ? (
          <section className="space-y-4">
            <div className="text-foreground font-light uppercase">Suggested Teams</div>

            <Swiper
              modules={[FreeMode, Scrollbar]}
              slidesPerView="auto"
              spaceBetween={16}
              freeMode
              scrollbar={{ draggable: true, hide: false }}
              className="team-swiper pb-6"
            >
              {featuredTeams.map((team) => (
                <SwiperSlide key={team.id} className="h-auto! w-71.5! md:w-76.25!">
                  <FeaturedTeamCard team={team} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        ) : null} */}

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-foreground font-light uppercase">All Teams</div>

            <Button asChild className="w-full sm:w-auto">
              <Link href="/teams/create">Create Team</Link>
            </Button>
          </div>

          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by team's name"
              className="border-border bg-surface-secondary/90 text-foreground placeholder:text-muted-foreground h-12 rounded-md pr-11"
            />
          </div>

          {showInitialSkeleton ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <TeamCardSkeleton key={index} />
              ))}
            </div>
          ) : teamsQuery.isError && !hasResults ? (
            <div className="px-1 py-8 text-center md:px-8">
              <div className="bg-primary/10 border-primary/20 text-primary mx-auto flex size-12 items-center justify-center rounded-full border">
                <Search className="size-5" />
              </div>
              <h3 className="font-kumbh mt-4 text-2xl font-bold">Unable to load teams</h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
                Refresh the page or try again in a moment.
              </p>
            </div>
          ) : hasResults ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allTeams.map((team) => (
                <MoreTeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="px-1 py-8 text-center md:px-8">
              <div className="bg-primary/10 border-primary/20 text-primary mx-auto flex size-12 items-center justify-center rounded-full border">
                <Search className="size-5" />
              </div>
              <h3 className="font-kumbh mt-4 text-2xl font-bold">
                {isSearching ? 'No matching teams found' : 'No teams found'}
              </h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-6">
                {isSearching
                  ? 'Try another keyword or clear the search to see every available team.'
                  : 'The teams list endpoint returned no data.'}
              </p>
            </div>
          )}
          {hasResults ? (
            <div className="mt-4">
              <div ref={loadMoreRef} className="h-1 w-full" aria-hidden="true" />
              {teamsQuery.isError && (
                <div className="mt-3 text-center">
                  <p className="text-destructive text-sm">Could not load more teams.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => teamsQuery.refetch()}
                  >
                    Try again
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

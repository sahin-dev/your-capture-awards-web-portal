'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import SwitchTeamDialog from '@/components/module/team/SwitchTeamDialog';
import { teamCardClass, teamShellClass } from '@/components/module/teams/teamUi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import type { TeamDetail } from '@/lib/mock/teamDetails';
import { useGetAllLevelsQuery, useGetUserProgressQuery } from '@/store/apis/levelsApi';
import {
  useGetTeamMembersQuery,
  useGetTeamQuery,
  useJoinTeamMutation,
  useSwitchTeamMutation,
} from '@/store/apis/teamApi';
import { getErrorMessage, showErrorToast } from '@/utils/team-feedback';
import { getAvatarClass, getInitials, getMemberName } from '@/utils/team-utils';
import { BadgeCheck, BarChartBig, Languages, MapPin, Medal, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

function formatSkillLabel(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRoleBadgeClass(level: string) {
  switch (level) {
    case 'LEADER':
      return 'border-primary/40 bg-primary/15 text-primary-soft-foreground';
    case 'MODERATOR':
      return 'border-sky-500/40 bg-sky-500/15 text-sky-100';
    default:
      return 'border-border-subtle bg-surface-secondary text-muted-foreground';
  }
}

function TeamDetailSkeleton() {
  return (
    <main className="margin container py-8 lg:py-10">
      <div className="space-y-5">
        <Skeleton className="h-4 w-32" />

        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-4/5 max-w-xl" />
        </div>

        <section className={`${teamShellClass} overflow-hidden`}>
          <div className="border-border border-b p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
                <Skeleton className="size-28 shrink-0 rounded-full sm:size-32 lg:size-36" />

                <div className="min-w-0 space-y-3 pt-1 sm:pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>

                  <Skeleton className="h-4 w-full max-w-4xl" />
                  <Skeleton className="h-4 w-11/12 max-w-3xl" />

                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-24 rounded-md" />
                    <Skeleton className="h-7 w-24 rounded-md" />
                    <Skeleton className="h-7 w-40 rounded-md" />
                  </div>
                </div>
              </div>

              <div className="flex w-full justify-end lg:w-auto lg:shrink-0">
                <Skeleton className="h-12 w-full rounded-md lg:w-32" />
              </div>
            </div>

            <div className={`${teamCardClass} relative mt-8 px-4 py-4 sm:px-5`}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="min-w-0 space-y-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-surface-secondary" />

          <div className="divide-black-2-600 divide-y">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 px-4 py-4 sm:grid sm:grid-cols-[56px_minmax(0,1fr)_240px] sm:px-6 lg:grid-cols-[64px_minmax(0,1fr)_280px]"
              >
                <Skeleton className="mx-auto hidden h-6 w-6 rounded-full sm:block" />

                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Skeleton className="block h-4 w-5 shrink-0 rounded sm:hidden" />
                  <Skeleton className="size-10 shrink-0 rounded-full sm:size-12" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end">
                  <Skeleton className="h-6 w-20 rounded-sm sm:w-24" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.teamId as string | undefined;
  const { user } = useAuth();
  const [memberPage, setMemberPage] = useState(1);

  const {
    data: apiResp,
    isLoading,
    isError,
  } = useGetTeamQuery(teamId ?? '', {
    skip: !teamId,
  });
  const {
    data: membersResp,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useGetTeamMembersQuery(
    { teamId: teamId ?? '', page: memberPage, limit: 10 },
    {
      skip: !teamId,
    },
  );

  const [joinTeam, { isLoading: isJoining }] = useJoinTeamMutation();
  const [switchTeam, { isLoading: isSwitching }] = useSwitchTeamMutation();
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const { data: levelsData } = useGetAllLevelsQuery({ page: 1, limit: 50 });
  const { data: progressData } = useGetUserProgressQuery(undefined, {
    skip: !user,
  });

  const apiTeam = ((apiResp as any)?.data ?? apiResp) as any;
  const resolvedTeam = apiTeam;

  const userLevelOrder = progressData?.data?.currentStatus?.order ?? 0;
  const requiredLevelOrder =
    levelsData?.data?.find((level) => level.levelName === resolvedTeam?.min_requirement_str)
      ?.order ?? 0;

  const isJoined =
    user?.joinedTeam?.teamId === resolvedTeam?.id ||
    user?.joinedTeam?.team?.id === resolvedTeam?.id;

  const members = membersResp?.data ?? [];
  const memberMeta = membersResp?.meta;

  useEffect(() => {
    if (memberMeta?.totalPage && memberPage > memberMeta.totalPage) {
      setMemberPage(memberMeta.totalPage);
    }
  }, [memberMeta?.totalPage, memberPage]);

  const metrics = resolvedTeam
    ? [
        { icon: Trophy, label: 'Team Score', value: resolvedTeam.score.toLocaleString() },
        { icon: Medal, label: 'Team Wins', value: resolvedTeam.win.toLocaleString() },
        {
          icon: BadgeCheck,
          label: 'Win Rate',
          value: `${Math.round((resolvedTeam.win / Math.max(resolvedTeam.total_matches, 1)) * 100)}%`,
        },
        {
          icon: Users,
          label: 'Team Members',
          value: `${resolvedTeam.member_count}/${resolvedTeam.member_slots}`,
        },
      ]
    : [];

  if (isLoading || isMembersLoading) {
    return <TeamDetailSkeleton />;
  }

  if (isError || !resolvedTeam) {
    return (
      <main className="margin container py-8 lg:py-10">
        <div className="text-muted-foreground py-10 text-sm">Team details could not be loaded.</div>
      </main>
    );
  }

  const handleJoinTeam = async () => {
    if (!teamId || isJoining) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (requiredLevelOrder > 0 && userLevelOrder > 0 && userLevelOrder < requiredLevelOrder) {
      showErrorToast(null, 'Your level does not meet this team minimum requirement');
      return;
    }

    try {
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

  const handleSwitchTeam = async () => {
    if (!teamId) return;

    try {
      await switchTeam(teamId).unwrap();
      setSwitchDialogOpen(false);
      router.replace('/teams/home');
    } catch (error) {
      showErrorToast(error, 'Failed to switch team');
    }
  };

  const rankedMembers = members.map((member, index) => ({
    ...member,
    points: resolvedTeam.score - ((memberPage - 1) * 10 + index) * 123456,
  }));

  return (
    <main className="margin container py-8 lg:py-10">
      <div className="space-y-5">
        <Link href="/teams" className="text-primary hover:text-primary text-sm font-medium">
          &lt; View Teams List
        </Link>

        <div className="space-y-2">
          <h1 className="font-kumbh text-foreground text-2xl font-bold sm:text-3xl">TEAM INFO</h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-6">
            Team details, member activity, and match strength in the same dark system used across
            the app.
          </p>
        </div>

        <section className={`${teamShellClass} overflow-hidden`}>
          <div className="border-border border-b p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
                <div className="border-border bg-surface-secondary relative size-28 shrink-0 overflow-hidden rounded-full border-4 sm:size-32 lg:size-36">
                  {resolvedTeam.badge ? (
                    <img
                      src={resolvedTeam.badge}
                      alt={resolvedTeam.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="bg-primary text-primary-foreground flex size-full items-center justify-center text-2xl font-bold">
                      {resolvedTeam.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-3 pt-1 sm:pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-kumbh text-foreground text-2xl font-bold sm:text-[28px]">
                      {resolvedTeam.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-primary/10 text-primary-soft-foreground"
                    >
                      {resolvedTeam.level}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        resolvedTeam.accessibility === 'PUBLIC'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          : 'border-border bg-surface-secondary text-muted-foreground'
                      }
                    >
                      {resolvedTeam.accessibility === 'PUBLIC' ? 'Public' : 'Private'}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground max-w-4xl text-sm leading-7 sm:text-[15px]">
                    {resolvedTeam.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="border-border bg-surface-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
                      <Languages size={12} /> {resolvedTeam.language}
                    </span>
                    <span className="border-border bg-surface-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
                      <MapPin size={12} /> {resolvedTeam.country}
                    </span>
                    <span className="border-border bg-surface-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
                      <BarChartBig size={12} />{' '}
                      {resolvedTeam.min_requirement_str
                        ? formatSkillLabel(resolvedTeam.min_requirement_str)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex w-full shrink-0 justify-end lg:w-auto">
                <Button
                  type="button"
                  onClick={handleJoinTeam}
                  disabled={isJoining || isJoined}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-md px-8 font-semibold disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto"
                >
                  {isJoined ? 'Joined' : isJoining ? 'Joining...' : 'Join Team'}
                </Button>
                <SwitchTeamDialog
                  open={switchDialogOpen}
                  onClose={() => setSwitchDialogOpen(false)}
                  currentTeamName={user?.joinedTeam?.team?.name || 'your current team'}
                  newTeamName={resolvedTeam?.name || 'this team'}
                  isSubmitting={isSwitching}
                  onConfirm={handleSwitchTeam}
                />
              </div>
            </div>

            <div className={`${teamCardClass} relative mt-8 px-4 py-4 sm:px-5`}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div key={metric.label} className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-foreground text-lg leading-none font-bold">
                          {metric.value}
                        </div>
                        <div className="text-muted-foreground mt-1 text-[11px] font-medium">
                          {metric.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Separator className="bg-surface-secondary" />

          <div className="divide-black-2-600 divide-y">
            {isMembersError ? (
              <div className="text-muted-foreground px-5 py-8 text-sm sm:px-6">
                Team members could not be loaded.
              </div>
            ) : rankedMembers.length > 0 ? (
              rankedMembers.map((member, index) => {
                const name = getMemberName(member.member);

                return (
                  <div
                    key={member.id}
                    className="hover:bg-surface-secondary/40 flex items-center justify-between gap-3 px-4 py-4 transition-colors sm:grid sm:grid-cols-[56px_minmax(0,1fr)_240px] sm:px-6 lg:grid-cols-[64px_minmax(0,1fr)_280px]"
                  >
                    <div className="text-muted-foreground hidden text-center text-lg font-medium sm:block">
                      {index + 1}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="text-muted-foreground block w-5 shrink-0 text-center text-sm font-medium sm:hidden">
                        {index + 1}
                      </span>
                      <Link
                        href={`/profile/${member.member.id}`}
                        className="group flex min-w-0 flex-1 items-center gap-3"
                      >
                        <Avatar className="size-10 shrink-0 sm:size-12">
                          {member.member.avatar && (
                            <AvatarImage src={member.member.avatar} className="object-cover" />
                          )}
                          <AvatarFallback
                            className={`text-sm font-semibold ${getAvatarClass(member.level)}`}
                          >
                            {getInitials(
                              member.member.fullName,
                              member.member.firstName ?? undefined,
                              member.member.lastName ?? undefined,
                            )}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="group-hover:text-primary truncate text-sm font-semibold transition-colors sm:text-base">
                            {name}
                          </p>
                          {member.member.location && (
                            <p className="text-muted-foreground text-xs">
                              {member.member.location}
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>

                    <div className="flex shrink-0 items-center justify-end">
                      <span
                        className={`inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-semibold tracking-[0.24em] uppercase sm:py-1 sm:text-xs ${getRoleBadgeClass(member.level)}`}
                      >
                        {member.level.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-muted-foreground px-5 py-8 text-sm sm:px-6">
                Team members are not available for this team yet.
              </div>
            )}
          </div>
          {memberMeta && memberMeta.totalPage > 1 && (
            <div className="border-border flex items-center justify-between border-t px-5 py-4 sm:px-6">
              <Button
                variant="outline"
                disabled={memberPage <= 1}
                onClick={() => setMemberPage((page) => page - 1)}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {memberPage} of {memberMeta.totalPage}
              </span>
              <Button
                variant="outline"
                disabled={memberPage >= memberMeta.totalPage}
                onClick={() => setMemberPage((page) => page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

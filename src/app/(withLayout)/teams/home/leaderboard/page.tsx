'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyTeamQuery, useGetTeamLeaderboardQuery } from '@/store/apis/teamApi';
import type { LeaderboardPeriod, TeamLeaderboardRow } from '@/store/types/teamTypes';
import { cn } from '@/utils/cn';

function getImageUrl(value?: string | null) {
  if (!value || value.includes('](') || !value.startsWith('http')) return null;
  return value;
}

function getTeamName(row: TeamLeaderboardRow) {
  return row.team?.name || 'Team';
}

// Coins paid per member of the top-3 teams once the period ends - see the
// team:weeklyPayout / team:monthlyPayout / team:yearlyPayout backend crons.
const PERIOD_REWARDS: Record<LeaderboardPeriod, number[]> = {
  weekly: [1000, 750, 500],
  monthly: [10000, 5000, 2500],
  yearly: [15000, 10000, 5000],
};

const PERIOD_NOUN: Record<LeaderboardPeriod, string> = {
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
};

function LeaderboardSkeleton() {
  return (
    <div className="border-border mt-5 overflow-hidden rounded-md border">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="border-border grid gap-3 border-b p-4 last:border-b-0 sm:grid-cols-[56px_minmax(0,1fr)_96px]"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-10" />
            <Skeleton className="mt-1 h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

function RewardsSummary({ period }: { period: LeaderboardPeriod }) {
  const rewards = PERIOD_REWARDS[period];
  const periodNoun = PERIOD_NOUN[period];

  return (
    <div className="flex justify-end">
      <div className="border-border bg-surface/50 w-full max-w-sm rounded-md border p-4 sm:max-w-md">
        <p className="text-sm font-semibold">This {periodNoun}&apos;s rewards</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {rewards.map((coins, index) => (
            <div key={index} className="flex w-full items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-3">
                <span className="text-2xl leading-none">{RANK_MEDALS[index]}</span>
                <span className="w-6 shrink-0 font-medium">{index + 1}</span>
              </span>
              <span className="shrink-0 text-right whitespace-nowrap">
                <span className="text-primary font-semibold">{coins.toLocaleString()} coins</span>
                <span className="text-muted-foreground"> / member</span>
              </span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          Estimated based on the current standing — nothing is awarded until this {periodNoun} ends,
          and rankings can still change.
        </p>
      </div>
    </div>
  );
}

const TeamLeaderboard = () => {
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('weekly');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [leaderboardPeriod]);

  const {
    data: leaderboardData,
    isLoading,
    isFetching,
    isError,
  } = useGetTeamLeaderboardQuery({
    period: leaderboardPeriod,
    page,
    limit: 10,
  });

  const { data: myTeamData } = useGetMyTeamQuery();
  const myTeamId = myTeamData?.data?.team?.id;
  const myTeamName = myTeamData?.data?.team?.name;

  const rows = leaderboardData?.data ?? [];
  const meta = leaderboardData?.meta;
  const totalPage = meta?.totalPage ?? 1;

  useEffect(() => {
    if (page > totalPage) setPage(totalPage);
  }, [page, totalPage]);

  const highlightId = useMemo(() => {
    if (myTeamId) return myTeamId;
    return rows.find((row) => row.team?.name === myTeamName)?.team?.id ?? null;
  }, [myTeamId, myTeamName, rows]);

  return (
    <section className="margin-user container space-y-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-kumbh text-xl font-bold">Team Leaderboard</h2>
          <p className="text-muted-foreground mt-1 text-sm">Fair matchmaking by skill level</p>
        </div>

        <div className="border-border bg-surface/50 grid grid-cols-3 gap-1 rounded-md border p-1">
          {(['weekly', 'monthly', 'yearly'] as LeaderboardPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setLeaderboardPeriod(period)}
              className={cn(
                'rounded-sm px-3 py-2 text-sm font-medium capitalize transition-colors',
                leaderboardPeriod === period
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-surface-secondary hover:text-primary-foreground',
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <RewardsSummary period={leaderboardPeriod} />

      {isLoading || isFetching ? (
        <LeaderboardSkeleton />
      ) : isError ? (
        <div className="border-border mt-5 rounded-md border p-6 text-center">
          <p className="font-semibold">Unable to load leaderboard</p>
          <p className="text-muted-foreground mt-1 text-sm">Refresh the page or try again later.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="border-border mt-5 rounded-md border p-6 text-center">
          <p className="font-semibold">No teams on the leaderboard yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Rankings will appear here once teams start competing.
          </p>
        </div>
      ) : (
        <div className="border-border mt-5 overflow-hidden rounded-md border">
          {rows.map((row) => {
            const teamName = getTeamName(row);
            const badgeUrl = getImageUrl(row.team?.badge);

            return (
              <div
                key={row.team?.id ?? row.rank}
                className={cn(
                  'border-border flex items-center gap-3 border-b p-4 last:border-b-0 sm:grid sm:grid-cols-[56px_minmax(0,1fr)_96px]',
                  row.team?.id === highlightId && 'bg-primary/10',
                )}
              >
                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {row.rank}
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
                  <div className="border-border bg-surface-secondary relative size-11 shrink-0 overflow-hidden rounded-full border">
                    {badgeUrl ? (
                      <Image
                        src={badgeUrl}
                        alt={teamName}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-primary text-primary-foreground flex size-full items-center justify-center text-xs font-bold">
                        {teamName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    {row.team?.id ? (
                      <Link
                        href={`/teams/${row.team.id}`}
                        className="hover:text-primary truncate font-semibold"
                      >
                        {teamName}
                      </Link>
                    ) : (
                      <p className="truncate font-semibold">{teamName}</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right sm:text-left">
                  <p className="font-semibold">{row.score}</p>
                  <p className="text-caption-foreground text-xs">Score</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !isFetching && !isError && totalPage > 1 ? (
        <div className="border-border mt-4 flex items-center justify-between gap-3 rounded-md border px-3 py-2">
          <p className="text-muted-foreground text-sm">
            Page {page} of {totalPage}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(totalPage, current + 1))}
              disabled={page >= totalPage}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default TeamLeaderboard;

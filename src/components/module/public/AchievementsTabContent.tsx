'use client';

import { LevelProgressBar } from '@/components/LevelProgressBar';
import { useAuth } from '@/hooks/useAuth';
import { useGetAllLevelsQuery, useGetUserProgressQuery } from '@/store/apis/levelsApi';
import { useGetProfileAchievementsQuery } from '@/store/apis/profileApi';
import type { ProfileAchievementBadge, ProfileAchievementGroup } from '@/store/types/profileTypes';
import { cn } from '@/utils/cn';
import { useEffect, useMemo, useState } from 'react';
import { BadgeImage } from './AchievementBadges';
import { AchievementCard } from './AchievementCard';
import { TabSectionHeader } from './public-tab-ui';

type Props = {
  username: string;
  isOwn?: boolean;
};

type SubTabKey = 'ultimate' | 'ranking';

type SelectedBadge = { tab: SubTabKey; badge: ProfileAchievementBadge };

function SubTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-xs font-bold tracking-wider uppercase transition duration-200 outline-none select-none',
        active
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-surface text-muted-foreground hover:bg-surface-secondary hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}

const AchievementsTabContent = ({ username, isOwn = false }: Props) => {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all levels (public endpoint)
  const { data: levelsData, isLoading: isLevelsLoading } = useGetAllLevelsQuery(
    { page: 1, limit: 50 },
    { skip: !isOwn },
  );

  // Fetch progress if own profile and authenticated
  const { data: progressData, isLoading: isProgressLoading } = useGetUserProgressQuery(undefined, {
    skip: !isAuthenticated || !isOwn,
  });
  const {
    data: achievementsData,
    isLoading: isAchievementsLoading,
    isError: isAchievementsError,
  } = useGetProfileAchievementsQuery(
    { isOwn, userId: username },
    {
      skip: !isOwn && !username,
    },
  );

  const userProgress = progressData?.data ?? null;
  const allLevels = userProgress?.levels?.map((level) => ({
    id: `progress-${level.order}`,
    level: level.order,
    levelName: level.name,
    order: level.order,
    requirements: level.requirements,
  })) ?? levelsData?.data ?? [];
  const currentLevelOrder = userProgress?.currentStatus?.order ?? null;
  const isLoading = isLevelsLoading || (isAuthenticated && isProgressLoading);
  const groups = achievementsData?.data?.groups ?? [];
  const groupByKey = useMemo(() => {
    return groups.reduce(
      (acc, group) => {
        acc[group.key] = group;
        return acc;
      },
      {} as Partial<Record<SubTabKey, ProfileAchievementGroup>>,
    );
  }, [groups]);

  // Sub-tab + selected badge state.
  // The card list starts collapsed — nothing is selected until the user
  // clicks an unlocked badge.
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('ultimate');
  const [selected, setSelected] = useState<SelectedBadge | null>(null);
  const activeGroup = groupByKey[activeSubTab];
  const activeBadges = activeGroup?.badges ?? [];

  // Collapse whenever the sub-tab changes.
  useEffect(() => {
    setSelected(null);
  }, [activeSubTab]);

  const handleBadgeClick = (kind: SubTabKey, id: string) => {
    const badge = groupByKey[kind]?.badges.find((b) => b.id === id);
    if (!badge || badge.count === 0) return;

    // Clicking an already-open badge collapses it again.
    setSelected((prev) => (prev?.badge.id === id ? null : { tab: kind, badge }));
  };

  return (
    <section className="container space-y-6 py-6">
      <TabSectionHeader title="Achievements" />

      {/* Level Progress Tracker */}
      {isOwn && (
        <div className="mb-6">
          {!mounted || isLoading ? (
            <div className="bg-surface-secondary/80 h-11 w-full animate-pulse rounded-lg" />
          ) : allLevels.length > 0 ? (
            <LevelProgressBar levels={allLevels} currentLevelOrder={currentLevelOrder} />
          ) : null}
        </div>
      )}

      {/* Sub-tab switcher */}
      <div className="border-border bg-surface/30 flex h-12 items-stretch gap-1.5 rounded-sm border p-1 shadow-sm">
        <SubTabButton
          active={activeSubTab === 'ultimate'}
          label={groupByKey.ultimate?.label ?? 'Ultimate Achievement'}
          onClick={() => setActiveSubTab('ultimate')}
        />
        <SubTabButton
          active={activeSubTab === 'ranking'}
          label={groupByKey.ranking?.label ?? 'Top Ranking'}
          onClick={() => setActiveSubTab('ranking')}
        />
      </div>

      {/* Badge grid */}
      {isAchievementsLoading ? (
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2.5">
              <div className="bg-surface-secondary aspect-square w-full animate-pulse rounded-full" />
              <div className="bg-surface-secondary h-6 w-10 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      ) : isAchievementsError ? (
        <div className="text-muted-foreground py-8 text-sm">Achievements could not be loaded.</div>
      ) : (
        <BadgeGrid
          badges={activeBadges}
          selectedId={selected?.tab === activeSubTab ? selected.badge.id : null}
          onSelect={(id) => handleBadgeClick(activeSubTab, id)}
        />
      )}

      {/* Card section — always rendered when something is selected */}
      {selected ? <CardSection selected={selected} /> : null}
    </section>
  );
};

/* ============================================================
   BADGE GRID
   Circular image-based badges. Modern treatment:
   - Soft inner gradient on the disc
   - Active state: thick primary ring + soft glow + inner highlight
   - Count pill: filled primary when active, subtle surface when 0
============================================================ */

function BadgeGrid({
  badges,
  selectedId,
  onSelect,
}: {
  badges: ProfileAchievementBadge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {badges.map((badge) => (
        <BadgeCell
          key={badge.id}
          title={badge.title || formatBadgeTitle(badge.category)}
          count={badge.count}
          active={selectedId === badge.id}
          onClick={() => onSelect(badge.id)}
        >
          <BadgeImage
            imageUrl={badge.imageUrl}
            alt={badge.title || badge.category}
            active={selectedId === badge.id}
            disabled={badge.count === 0}
          />
        </BadgeCell>
      ))}
    </div>
  );
}

function formatBadgeTitle(value: string) {
  const formatted = value
    .replace(/\bTOP_/g, 'Top ')
    .replace(/_PHOTO\b/g, ' Photo')
    .replace(/_PHOTOGRAPHER\b/g, ' Photographer')
    .replace(/_DAY\b/g, ' Day')
    .replace(/_YEAR\b/g, ' Year')
    .replace(/_PERCENT\b/g, ' Percent')
    .replace(/_ACHIEVEMENT\b/g, ' Achievement')
    .replace(/_PICK\b/g, ' Pick')
    .replace(/_BADGE\b/g, ' Badge')
    .replace(/_/g, ' ')
    .toLowerCase();

  return formatted
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function BadgeCell({
  title,
  count,
  active = false,
  onClick,
  children,
}: {
  title: string;
  count: number;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const disabled = count === 0;
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
        aria-pressed={active}
        className={cn(
          'group/badge relative aspect-square w-full cursor-pointer rounded-full outline-none',
          'transition-all',
          !disabled &&
            'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
          disabled && 'cursor-not-allowed',
        )}
      >
        {children}
      </button>

      <div className="min-w-0 text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground/90 line-clamp-2">
        {title}
      </div>

      <span
        className={cn(
          'bg-card inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium tracking-wider',
          disabled
            ? 'bg-surface-secondary text-disabled-foreground'
            : active
              ? 'text-primary'
              : 'text-foreground',
        )}
      >
        x{count}
      </span>
    </div>
  );
}

/* ============================================================
   CARD SECTION
   Compact section header + clean grid of image cards. The
   title sits inside each card (no separate heading).
============================================================ */

function CardSection({ selected }: { selected: SelectedBadge }) {
  const { badge } = selected;

  return (
    <section className="border-border bg-surface animate-fade-in space-y-4 rounded-xl border p-5">
      {/* Compact section title — keeps the original small header style */}

        <h3 className="text-foreground text-sm font-bold tracking-wider uppercase">
          {badge.title}
        </h3>


      {/* Card grid */}
      {badge.cards.length === 0 ? (
        <div className="text-muted-foreground p-8 text-center text-sm">
          No cards to show yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badge.cards.map((card) => (
            <AchievementCard key={card.id} item={card} />
          ))}
        </div>
      )}
    </section>
  );
}

export default AchievementsTabContent;

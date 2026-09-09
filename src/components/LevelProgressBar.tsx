'use client';

import { cn } from '@/utils/cn';
import { Check, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export interface LevelItem {
  id: string;
  levelName: string;
  order: number;
  level: number;
  requirements: {
    type?: string;
    title?: string;
    badge?: string;
    required: number;
    current?: number;
    percentage?: number;
    progressPercentage?: number;
    satisfied?: boolean;
  }[];
}

interface LevelProgressBarProps {
  levels: LevelItem[];
  currentLevelOrder: number | null;
  className?: string;
}

export function LevelProgressBar({
  levels,
  currentLevelOrder = 1,
  className,
}: LevelProgressBarProps) {
  const [hoveredLock, setHoveredLock] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('top');
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode>(null);

  if (!levels || levels.length === 0) return null;

  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);
  const currentIdx = sortedLevels.findIndex((l) => l.order === currentLevelOrder);
  const safeCurrentIdx = currentIdx === -1 ? 0 : currentIdx;

  const handleEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    lockId: string,
    content: React.ReactNode,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      top: rect.top < 190 ? rect.bottom + 12 : rect.top - 12,
      left: rect.left + rect.width / 2,
    });
    setTooltipPlacement(rect.top < 190 ? 'bottom' : 'top');
    setTooltipContent(content);
    setHoveredLock(lockId);
  };

  const handleLeave = () => {
    setHoveredLock(null);
  };

  const formatBadgeLabel = (value: string) => {
    const normalized = value ?? '';

    if (/YC_TOP_PICK|TOP_PICK|GURUS?\b|YC\b/i.test(normalized)) {
      return '';
    }

    const formatted = normalized
      .replace(/\bTOP_/g, 'Top ')
      .replace(/_PHOTO\b/g, ' Photo')
      .replace(/_PHOTOS\b/g, ' Photos')
      .replace(/_PHOTOGRAPHER\b/g, ' Photographer')
      .replace(/_DAY\b/g, ' Day')
      .replace(/_YEAR\b/g, ' Year')
      .replace(/_PERCENT\b/g, ' Percent')
      .replace(/_ACHIEVEMENT\b/g, ' Achievement')
      .replace(/_BADGE\b/g, ' Badge')
      .replace(/_/g, ' ')
      .toLowerCase();

    return formatted
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatRequirementLabel = (requirement: {
    type?: string;
    title?: string;
    badge?: string;
    badges?: string[];
  }) => {
    const badgeLabels = requirement.badges?.length
      ? requirement.badges.map(formatBadgeLabel).filter(Boolean)
      : requirement.badge
        ? [formatBadgeLabel(requirement.badge)].filter(Boolean)
        : [];

    if (badgeLabels.length > 0) {
      return badgeLabels;
    }

    const fallback = requirement.title ?? requirement.type?.replaceAll('_', ' ') ?? 'Requirement';
    return [
      fallback
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    ];
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="w-full scrollbar-auto overflow-x-auto">
        {/* Single wrapper — border only, NO overflow-hidden */}
        <div className="border-border relative flex h-11 w-full min-w-275 rounded-sm border">
          {sortedLevels.map((level, index) => {
            const isUnlocked = index <= safeCurrentIdx;
            const isActive = index === safeCurrentIdx;
            const hasLock = index < sortedLevels.length - 1;
            const isFirst = index === 0;
            const isLast = index === sortedLevels.length - 1;

            const nextLevel = hasLock ? sortedLevels[index + 1] : null;
            const isLockUnlocked = index < safeCurrentIdx;
            const isBoundaryLock = index === safeCurrentIdx;
            const isNextLevelComplete = Boolean(
              nextLevel && currentLevelOrder !== null && nextLevel.order <= currentLevelOrder,
            );
            const lockId = nextLevel ? `lock-${level.id}-${nextLevel.id}` : '';

            const reqText = nextLevel ? (
              <div className="w-56 space-y-2 text-left sm:w-72">
                <div className="border-border-subtle flex items-center justify-between border-b pb-2">
                  <div className="text-foreground text-xs font-extrabold tracking-wide truncate">
                    {nextLevel.levelName}
                  </div>
                  <span className="bg-surface-tertiary rounded-full px-2 py-1 text-[8px] font-bold tracking-wider uppercase">
                    {isNextLevelComplete ? 'Complete' : 'In progress'}
                  </span>
                </div>
                {nextLevel.requirements?.flatMap((requirement, requirementIndex) => {
                  const labels = formatRequirementLabel(requirement);
                  const requirementItems = labels.map((formattedLabel) => ({
                    label: formattedLabel,
                    requirement,
                  }));

                  return requirementItems.map((item, itemIndex) => {
                    const { label, requirement: req } = item;
                    const current = req.current ?? 0;
                    const calculatedPercent = req.required > 0 ? (current / req.required) * 100 : 0;
                    const apiPercent = req.percentage ?? req.progressPercentage;
                    const requirementPercent = Math.min(
                      100,
                      Math.max(0, apiPercent && apiPercent > 0 ? apiPercent : calculatedPercent),
                    );
                    const complete = req.satisfied === true || current >= req.required || requirementPercent >= 100;
                    const displayCurrent = current;
                    const displayPercent = requirementPercent;
                    const readablePercent = displayPercent > 0 && displayPercent < 0.1 ? 0.1 : displayPercent;

                    return (
                      <div key={`${label}-${requirementIndex}-${itemIndex}`} className="flex items-start gap-2 py-1">
                        <span
                          className={cn(
                            'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                            complete
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/70 bg-transparent text-transparent',
                          )}
                        >
                          {complete && <Check className="size-2.5 stroke-[3]" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              'truncate text-[11px] leading-5',
                              complete ? 'text-foreground font-semibold' : 'text-muted-foreground',
                            )}
                          >
                            {label}
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2 text-[9px]">
                            <span className={complete ? 'text-foreground/70' : 'text-muted-foreground'}>
                              {displayCurrent} / {req.required}
                            </span>
                            <span className="text-muted-foreground">
                              {readablePercent.toFixed(readablePercent < 1 ? 1 : 0)}%
                            </span>
                          </div>
                          <div className="bg-surface-tertiary mt-1 h-1 w-full overflow-hidden rounded-full">
                            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${readablePercent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            ) : '';

            return (
              <div
                key={`lvl-${level.id}`}
                className={cn(
                  'border-border/40 relative flex h-full flex-1 items-center justify-center border-r px-8 transition-all duration-300 last:border-r-0',
                  isUnlocked
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface text-muted-foreground',
                  isFirst && 'rounded-l-sm',
                  isLast && 'rounded-r-sm',
                )}
              >
                <span
                  className={cn(
                    'z-10 text-[10px] font-bold tracking-wider uppercase',
                    isActive && 'font-extrabold',
                  )}
                >
                  {level.levelName}
                </span>

                {hasLock && (
                  <div
                    className="absolute top-1/2 right-0 z-20 flex cursor-help items-center justify-center"
                    style={{ transform: 'translate(50%, -50%)', width: '28px', height: '28px' }}
                    onMouseEnter={(e) => handleEnter(e, lockId, reqText)}
                    onMouseLeave={handleLeave}
                  >
                    {isLockUnlocked ? (
                      <div className="text-foreground flex size-7 items-center justify-center">
                        <Unlock className="size-4.5 stroke-[2.5]" />
                      </div>
                    ) : isBoundaryLock ? (
                      <div className="border-border bg-surface-tertiary text-foreground flex size-7 items-center justify-center rounded-full border shadow-md">
                        <Lock className="size-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="border-border bg-surface text-foreground flex size-7 items-center justify-center rounded-full border shadow-md">
                        <Lock className="size-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Tooltip rendered via portal directly under <body> — escapes overflow-x-auto clipping */}
      {hoveredLock &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="pointer-events-none fixed rounded-lg border border-white/20 bg-[#202020] px-3.5 py-3 text-[9px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.55)]"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: tooltipPlacement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
              zIndex: 9999,
            }}
          >
            {tooltipContent}
            <div
              className={cn(
                'absolute left-1/2 size-2 -translate-x-1/2 rotate-45 border-white/20 bg-[#202020]',
                tooltipPlacement === 'top'
                  ? 'top-full -mt-1 border-r border-b'
                  : 'bottom-full -mb-1 border-t border-l',
              )}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

import CornerCount from '@/components/CornerCount';
import { Button } from '@/components/ui/button';
import CountdownTimer from '@/components/CountdownTimer';
import { cn } from '@/utils/cn';
import { Match } from '@/types/match';
import { Search, Users } from 'lucide-react';
import Image from 'next/image';

interface MatchCardProps {
  match: Match;
  onStart: (match: Match) => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  canManageMatch?: boolean;
}

function MatchCard({
  match,
  onStart,
  actionLabel = 'Start Match',
  actionDisabled = false,
  canManageMatch = false,
}: MatchCardProps) {
  let teamMembersLabel = '';
  if (match.hasJoined) {
    if (match.teamsJoined <= 0) {
      teamMembersLabel = 'You participated';
    } else if (match.teamsJoined === 1) {
      teamMembersLabel = 'You & 1 other participated';
    } else {
      teamMembersLabel = `You & ${match.teamsJoined} others participated`;
    }
  } else {
    if (match.teamsJoined <= 0) {
      teamMembersLabel = '0 Participated';
    } else if (match.teamsJoined === 1) {
      teamMembersLabel = '1 Participated';
    } else {
      teamMembersLabel = `${match.teamsJoined} Participated`;
    }
  }
  const banner = match.teamA.badge || '/images/TeamPhoto.png';
  const startDate = new Date(match.endsAt.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const endDate = match.endsAt.toISOString();
  const buttonLabel = match.queueStatus
    ? 'View Match'
    : match.hasJoined || canManageMatch
      ? actionLabel
      : 'Join Contest';
  const StatusIcon = match.queueStatus === 'WAITING_FOR_MEMBERS' ? Users : Search;

  return (
    <article className="group border-border bg-surface-secondary/80 overflow-hidden rounded-xl border-2">
      <div className="relative h-72 overflow-hidden">
        {/* Banner image */}
        <Image
          src={banner}
          alt={match.theme}
          fill
          className="object-cover transition duration-300 group-hover:brightness-50"
          sizes="(max-width: 768px) 100vw, 500px"
        />

        {/* Top gradient — ensures title is always readable */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-linear-to-b from-black/85 to-transparent" />

        {/* Upload limit badge */}
        <CornerCount
          count={match.photosRequired}
          label={match.countLabel ?? 'PHOTOS'}
          className="z-10"
        />

        {/* Title — top left, always visible, large */}
        <div className="absolute top-3 right-14 left-3 z-10">
          <h3 className="line-clamp-2 text-base leading-snug font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,1)]">
            {match.theme}
          </h3>
        </div>

        {match.queueStatus && (
          <div className="absolute top-14 left-3 z-10">
            <div className="bg-black/45 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <StatusIcon className={cn('size-3', match.queueStatus === 'SEARCHING' && 'animate-pulse')} />
              {match.queueStatus === 'WAITING_FOR_MEMBERS' ? 'Waiting for members' : 'Searching'}
            </div>
          </div>
        )}

        {/* Action Button — center; always visible once a match is in progress, otherwise hover only */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-all duration-300',
            match.queueStatus ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-auto rounded px-6 py-2 text-sm font-medium uppercase shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onStart(match)}
            disabled={actionDisabled}
          >
            {buttonLabel}
          </Button>
        </div>

        {/* Footer stats — absolute bottom, zero gap */}
        <div className="text-foreground absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-zinc-950/90 py-2">
          <div className="border-primary flex h-12 flex-1 flex-col items-center justify-center border-r px-1 text-center">
            <p className="text-sm font-semibold">{teamMembersLabel}</p>
          </div>
          <div className="flex h-12 flex-[1.3] flex-col items-center justify-center px-1">
            <CountdownTimer startDate={startDate} endDate={endDate} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default MatchCard;

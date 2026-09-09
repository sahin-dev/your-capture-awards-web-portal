import { MatchPhoto, MatchTeam } from '@/types/match';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/match-utils';
import { Vote } from 'lucide-react';
import Image from 'next/image';

interface PhotoListPanelProps {
  team: MatchTeam;
  side: 'left' | 'right';
}

function PhotoListPanel({ team, side }: PhotoListPanelProps) {
  // Sort photos by votes desc
  const sorted = [...team.photos].sort((a, b) => b.votes - a.votes);
  const maxVotes = sorted[0]?.votes ?? 1;

  return (
    <div className="min-w-0 flex-1">
      {/* Header */}
      {/* <div className=" px-3 py-2.5">
        <p className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase">
          {team.name}
        </p>
      </div> */}

      {/* Scrollable list */}
      <div className="h-72 scrollbar-none space-y-1.5 overflow-y-auto p-2">
        {sorted.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            No members joined yet
          </div>
        ) : (
          sorted.map((photo, i) => (
            <PhotoRow key={photo.id} photo={photo} rank={i + 1} maxVotes={maxVotes} />
          ))
        )}
      </div>
    </div>
  );
}

function PhotoRow({
  photo,
  rank,
  maxVotes,
}: {
  photo: MatchPhoto;
  rank: number;
  maxVotes: number;
}) {
  const pct = maxVotes > 0 ? Math.round((photo.votes / maxVotes) * 100) : 0;

  return (
    <div className="bg-primary/5 relative overflow-hidden rounded-md px-2.5 py-2">
      {/* Vote bar background */}
      <div
        className="bg-primary/8 absolute inset-y-0 left-0 rounded-md transition-all duration-500"
        style={{ width: `${pct}%` }}
      />

      <div className="relative flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {/* Rank */}
          <span
            className={cn(
              'flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
              rank === 1
                ? 'bg-warning text-warning-foreground'
                : rank === 2
                  ? 'bg-surface-secondary text-muted-foreground'
                  : rank === 3
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
            )}
          >
            {rank}
          </span>

          {/* Avatar */}
          <div className="bg-muted size-8 shrink-0 overflow-hidden rounded-full">
            {photo.member.avatar ? (
              <Image
                src={photo.member.avatar}
                alt={photo.member.fullName}
                width={32}
                height={32}
                className="size-8 object-cover"
              />
            ) : (
              <div className="text-muted-foreground bg-muted flex size-8 items-center justify-center text-[9px] font-bold">
                {getInitials(photo.member.fullName)}
              </div>
            )}
          </div>

          {/* Name */}
          <span className="truncate text-xs font-medium">{photo.member.fullName}</span>
        </div>

        {/* Votes */}
        <div className="bg-surface-secondary text-foreground flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
          {photo.votes.toLocaleString()}
          <Vote size={10} />
        </div>
      </div>
    </div>
  );
}

export default PhotoListPanel;

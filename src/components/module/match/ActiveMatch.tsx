import SafeBannerImage from '@/components/SafeBannerImage';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useCountdown from '@/hooks/useCountdown';
import { Match } from '@/types/match';
import { cn } from '@/utils/cn';
import { Camera } from 'lucide-react';

import CountDown from './CountDown';
import PhotoListPanel from './PhotoListPanel';
import TeamVsPanel from './TeamVsPanel';

interface ActiveMatchProps {
  match: Match;
  onLeave: () => void;
  actionLabel: string;
  actionDisabled?: boolean;
  actionDisabledReason?: string;
  onAction: () => void;
}

function ActiveMatch({
  match,
  onLeave,
  actionLabel,
  actionDisabled,
  actionDisabledReason,
  onAction,
}: ActiveMatchProps) {
  const remaining = useCountdown(match.endsAt);
  const isEnded = remaining <= 0;
  const isActive = !isEnded;

  const aWinning = match.teamA.totalVotes >= match.teamB.totalVotes;
  const totalVotes = match.teamA.totalVotes + match.teamB.totalVotes;
  const aPct = totalVotes > 0 ? Math.round((match.teamA.totalVotes / totalVotes) * 100) : 50;
  const bPct = 100 - aPct;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'size-2 rounded-full',
                isEnded ? 'bg-muted-foreground' : 'bg-success animate-pulse',
              )}
            />
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {isEnded ? 'Match ended' : 'Match is on!'}
            </p>
          </div>
          <p
            className={cn(
              'font-mono text-2xl font-bold tabular-nums',
              remaining < 60_000 && !isEnded && 'text-destructive',
            )}
          >
            <CountDown endDate={match.endsAt} />
          </p>
        </div>

        <div className="bg-surface relative min-h-28 overflow-hidden rounded-md border">
          <SafeBannerImage
            src={match.banner}
            alt={`${match.theme} banner`}
            className="object-cover opacity-55"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/40 to-zinc-950/10" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
            <h1 className="text-foreground text-center text-xl leading-tight font-semibold">
              {match.theme}
            </h1>
            <div className="text-foreground flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="bg-overlay inline-flex items-center gap-1 rounded-full px-3 py-1">
                <Camera size={12} />
                {match.photosRequired} photos
              </span>
            </div>
            {isActive ? (
              <div className="space-y-1.5">
                <Button
                  size="sm"
                  disabled={actionDisabled}
                  className="bg-primary-foreground text-background hover:bg-surface-secondary disabled:bg-surface-secondary h-7 rounded-sm px-3 text-xs font-semibold"
                  onClick={onAction}
                >
                  <Camera size={12} className="mr-1.5" />
                  {actionLabel}
                </Button>
                {actionDisabledReason ? (
                  <p className="text-foreground text-[10px] font-medium">{actionDisabledReason}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <TeamVsPanel
          teamA={match.teamA}
          teamB={match.teamB}
          aPct={aPct}
          bPct={bPct}
          aWinning={aWinning}
        />

        <Separator />

        <div className="flex gap-0">
          <PhotoListPanel team={match.teamA} side="left" />
          <div className="bg-border w-px shrink-0" />
          <PhotoListPanel team={match.teamB} side="right" />
        </div>
      </div>
    </div>
  );
}

export default ActiveMatch;

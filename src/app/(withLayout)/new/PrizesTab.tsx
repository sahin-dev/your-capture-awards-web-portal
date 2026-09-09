import { cn } from '@/utils/cn';
import { Camera, Coins, Gift, Image, LucideIcon, Medal, Search, Star, Zap } from 'lucide-react';

const PRIZES = [
  {
    title: 'Top photographer winner',
    icon: 'camera',
    bg: 'bg-amber-100 dark:bg-amber-950',
    fg: 'text-amber-700 dark:text-amber-300',
    stats: [
      { icon: 'gift', value: 'x20' },
      { icon: 'bolt', value: 'x40' },
      { icon: 'search', value: 'x15' },
    ],
  },
  {
    title: 'Top photo winner',
    icon: 'photo',
    bg: 'bg-blue-100 dark:bg-blue-950',
    fg: 'text-blue-700 dark:text-blue-300',
    stats: [
      { icon: 'gift', value: 'x20' },
      { icon: 'bolt', value: 'x40' },
      { icon: 'search', value: 'x15' },
    ],
  },
  {
    title: 'Top 50 photographer',
    icon: 'medal',
    bg: 'bg-muted',
    fg: 'text-muted-foreground',
    stats: [
      { icon: 'gift', value: 'x1' },
      { icon: 'bolt', value: 'x1' },
      { icon: 'coin', value: '100' },
    ],
  },
] as const;

const PRIZE_ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  photo: Image,
  star: Star,
  medal: Medal,
  gift: Gift,
  bolt: Zap,
  search: Search,
  coin: Coins,
};

function PrizeCard({ prize }: { prize: (typeof PRIZES)[number] }) {
  const Icon = PRIZE_ICONS[prize.icon];

  return (
    <div className="border-border bg-surface flex items-center gap-5 rounded-lg border p-8">
      <div className={cn('flex size-20 shrink-0 items-center justify-center rounded-lg', prize.bg)}>
        <Icon className={cn('h-5 w-5', prize.fg)} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xl leading-snug font-medium">{prize.title}</p>
        <div className="text-muted-foreground mt-3 flex items-center gap-3">
          {prize.stats.map((stat, i) => {
            const StatIcon = PRIZE_ICONS[stat.icon];
            return (
              <span key={i} className="flex items-center gap-1">
                <StatIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {stat.value}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PrizesTab() {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
      {PRIZES.map((prize) => (
        <PrizeCard key={prize.title} prize={prize} />
      ))}
    </div>
  );
}

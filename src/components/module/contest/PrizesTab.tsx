'use client';

import { TabsContent } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { Camera, Image as PhotoIcon, LucideIcon, Star, Trophy } from 'lucide-react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { IoKeyOutline } from 'react-icons/io5';
import { MdOutlineCameraswitch } from 'react-icons/md';

const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  image: PhotoIcon,
  trophy: Trophy,
  star: Star,
  medal: Trophy,
};

const prizeIcon = (prize: any) => {
  if (prize?.icon && ICONS[prize.icon]) return ICONS[prize.icon];
  if (prize?.category === 'TOP_PHOTOGRAPHER') return Camera;
  if (prize?.category === 'TOP_PHOTO') return PhotoIcon;
  if (prize?.category === 'YC_PICK') return Star;
  return Trophy;
};

// Top 10/20/50/100/200 (Photos/Photographers) are ranking badges only - the
// contest doesn't actually attach a reward to them, so showing them in the
// Prizes tab alongside real rewards (Top Photo, Top Photographer, etc.) is
// misleading. Only the un-numbered TOP_PHOTO/TOP_PHOTOGRAPHER awards remain.
const isTierRankingPrize = (prize: any) => /^TOP_\d+_/.test(prize?.category ?? '');

const PrizesTab = ({ contest, value }: { contest: any; value: string }) => {
  const visiblePrizes = (contest?.prizes ?? [])
    .filter((prize: any) => prize?.enabled !== false && !isTierRankingPrize(prize))
    .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0));

  return (
    <TabsContent
      value={value}
      className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2"
    >
      {visiblePrizes.map((prize: any) => {
        const Icon = prizeIcon(prize);
        const stats = [
          prize?.swap != null && {
            icon: MdOutlineCameraswitch,
            label: `x${prize.swap}`,
            name: 'Trade',
          },
          prize?.boost != null && { icon: IoKeyOutline, label: `x${prize.boost}`, name: 'Promote' },
          prize?.key != null && {
            icon: AiOutlineThunderbolt,
            label: `x${prize.key}`,
            name: 'Charge',
          },
          prize?.coin != null && {
            image: '/icons/ycw-coin.png',
            label: prize.coin.toLocaleString(),
            name: 'YCW Coin',
          },
        ].filter(Boolean) as { icon?: LucideIcon; image?: string; label: string; name: string }[];
        return (
          <article
            key={prize?.id ?? prize?.slotKey}
            className="border-border bg-surface flex min-w-0 items-center gap-4 rounded-lg border p-5 sm:gap-5 sm:p-8"
          >
            <div
              className={cn(
                'bg-primary/12 text-primary flex size-16 shrink-0 items-center justify-center rounded-lg sm:size-20',
              )}
            >
              <Icon className="size-6 sm:size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-medium sm:text-xl">
                {prize?.title ?? prize?.category}
              </h3>
              {prize?.description && (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {prize.description}
                </p>
              )}
              {stats.length > 0 && (
                <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  {stats.map(({ icon: ResourceIcon, image, label, name }) => (
                    <span
                      key={`${name}-${label}`}
                      className="flex items-center gap-1.5"
                      title={name}
                    >
                      {ResourceIcon ? (
                        <ResourceIcon
                          className={cn('text-primary size-4', name === 'Trade' && 'rotate-90')}
                        />
                      ) : (
                        <Image
                          src={image!}
                          alt={name}
                          width={20}
                          height={20}
                          className="size-5 object-contain"
                        />
                      )}
                      <span>{label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        );
      })}
      {!visiblePrizes.length && (
        <p className="text-muted-foreground col-span-full py-12 text-center">
          No prizes have been added for this contest.
        </p>
      )}
    </TabsContent>
  );
};

export default PrizesTab;

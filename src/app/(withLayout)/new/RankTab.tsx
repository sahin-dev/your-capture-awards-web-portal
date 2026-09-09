'use client';

import { cn } from '@/utils/cn';
import { Award, Crown, Shield, Star, Trophy, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/* ---------------------------------- Data ---------------------------------- */

const RANK_SUB_TABS = [
  { id: 'photographer', label: 'Top photographer' },
  { id: 'photo', label: 'Top photo' },
];

const LEVELS = ['Popular', 'Skilled', 'Premier', 'Elite', 'All star'];

const LEVEL_BADGES: Record<string, { icon: typeof Star; className: string }> = {
  Popular: { icon: Star, className: 'text-sky-500 border-sky-500/40 bg-sky-500/10' },
  Skilled: { icon: Award, className: 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10' },
  Premier: { icon: Shield, className: 'text-violet-500 border-violet-500/40 bg-violet-500/10' },
  Elite: { icon: Trophy, className: 'text-amber-500 border-amber-500/40 bg-amber-500/10' },
  'All star': { icon: Crown, className: 'text-rose-500 border-rose-500/40 bg-rose-500/10' },
};

type PhotoWithVotes = { src: string; votes: number };

type Rank = {
  rank: number;
  name: string;
  country: string;
  votes: number;
  avatar: string;
  photos: PhotoWithVotes[];
};

const avatarUrl = (seed: string) => `https://picsum.photos/seed/${seed}/120/120`;
const photoUrl = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

// max 4 ta photo, fixed - r 1-5 random na
const PHOTOS_PER_CARD = 4;

function buildRank(rank: number, name: string, country: string, votes: number, seed: string): Rank {
  return {
    rank,
    name,
    country,
    votes,
    avatar: avatarUrl(seed),
    photos: Array.from({ length: PHOTOS_PER_CARD }, (_, i) => ({
      src: photoUrl(`${seed}-${i}`),
      votes: Math.floor(votes / (i + 1)) + 20,
    })),
  };
}

const FAKE_NAMES = [
  'Bella De',
  'Michael Lorengel',
  'Sara Ionescu',
  'Owen Clarke',
  'Deja Vu',
  'Andrew So',
  'Lina Petrova',
  'Dean Darling',
  'Nora Vance',
  'Hassan Ali',
  'Kaito Mori',
  'Freya Solberg',
  'Ivy Osei',
  'Marco Rinaldi',
  'Yuki Tanaka',
  'Elena Popescu',
  'Liam O Brien',
  'Amara Diallo',
  'Noah Berg',
  'Priya Nair',
  'Carlos Mendez',
  'Sofia Rossi',
  'Tomas Novak',
  'Aiko Sato',
  'Ben Walker',
];
const FAKE_COUNTRIES = [
  'Germany',
  'Romania',
  'Ireland',
  'East Timor',
  'Reunion',
  'Bulgaria',
  'Portugal',
  'Canada',
  'Egypt',
  'Japan',
  'Norway',
  'Ghana',
  'Italy',
  'Poland',
  'Nigeria',
  'Sweden',
  'Kenya',
  'Spain',
  'India',
  'Mexico',
];

function generateLevelRanks(levelSeed: string, baseVotes: number, count = 20): Rank[] {
  return Array.from({ length: count }, (_, i) =>
    buildRank(
      i + 1,
      FAKE_NAMES[i % FAKE_NAMES.length],
      FAKE_COUNTRIES[i % FAKE_COUNTRIES.length],
      Math.max(baseVotes - i * 7, 20),
      `${levelSeed}-${i + 1}`,
    ),
  );
}

const PHOTOGRAPHER_RANKS: Record<string, Rank[]> = {
  Popular: generateLevelRanks('popular', 390),
  Skilled: generateLevelRanks('skilled', 500),
  Premier: generateLevelRanks('premier', 900),
  Elite: generateLevelRanks('elite', 2200),
  'All star': generateLevelRanks('allstar', 3400),
};

type PhotoItem = {
  id: number;
  name: string;
  country: string;
  span: string;
  image: string;
  avatar: string;
};

const PHOTO_ITEMS: PhotoItem[] = [
  {
    id: 1,
    name: 'Bella De',
    country: 'Germany',
    span: 'col-span-1',
    image: photoUrl('grid-1'),
    avatar: avatarUrl('grid-1'),
  },
  {
    id: 2,
    name: 'Michael Lorengel',
    country: 'Germany',
    span: 'col-span-1',
    image: photoUrl('grid-2'),
    avatar: avatarUrl('grid-2'),
  },
  {
    id: 3,
    name: 'Sara Ionescu',
    country: 'Romania',
    span: 'col-span-2',
    image: photoUrl('grid-3'),
    avatar: avatarUrl('grid-3'),
  },
  {
    id: 4,
    name: 'Owen Clarke',
    country: 'Ireland',
    span: 'col-span-1',
    image: photoUrl('grid-4'),
    avatar: avatarUrl('grid-4'),
  },
  {
    id: 5,
    name: 'Deja Vu',
    country: 'East Timor',
    span: 'col-span-1',
    image: photoUrl('grid-5'),
    avatar: avatarUrl('grid-5'),
  },
  {
    id: 6,
    name: 'Andrew So',
    country: 'Reunion',
    span: 'col-span-1',
    image: photoUrl('grid-6'),
    avatar: avatarUrl('grid-6'),
  },
  {
    id: 7,
    name: 'Lina Petrova',
    country: 'Bulgaria',
    span: 'col-span-1',
    image: photoUrl('grid-7'),
    avatar: avatarUrl('grid-7'),
  },
  {
    id: 8,
    name: 'Dean Darling',
    country: 'Portugal',
    span: 'col-span-2',
    image: photoUrl('grid-8'),
    avatar: avatarUrl('grid-8'),
  },
  {
    id: 9,
    name: 'Nora Vance',
    country: 'Canada',
    span: 'col-span-1',
    image: photoUrl('grid-9'),
    avatar: avatarUrl('grid-9'),
  },
  {
    id: 10,
    name: 'Kaito Mori',
    country: 'Japan',
    span: 'col-span-1',
    image: photoUrl('grid-10'),
    avatar: avatarUrl('grid-10'),
  },
  {
    id: 11,
    name: 'Freya Solberg',
    country: 'Norway',
    span: 'col-span-1',
    image: photoUrl('grid-11'),
    avatar: avatarUrl('grid-11'),
  },
  {
    id: 12,
    name: 'Ivy Osei',
    country: 'Ghana',
    span: 'col-span-1',
    image: photoUrl('grid-12'),
    avatar: avatarUrl('grid-12'),
  },
];

/* ---------------------------------- Root ---------------------------------- */

export function RankTab() {
  const [subTab, setSubTab] = useState('photographer');

  return (
    <div className="">
      <div className="bg-background border-border sticky top-14 z-20 mb-6 flex gap-6 border-b pt-2.5">
        {RANK_SUB_TABS.map((t) => {
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={cn(
                'border-b-2 px-0.5 pb-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-foreground text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {subTab === 'photographer' && <PhotographerLevelRanks />}
      {subTab === 'photo' && <PhotoGrid data={PHOTO_ITEMS} />}
      {subTab === 'guru' && <PhotoGrid data={PHOTO_ITEMS} />}
    </div>
  );
}

/* ------------------------- Ribbon-shaped level button ------------------------- */

function RibbonButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const fill = active ? 'rgb(37 99 235)' : 'rgb(38 38 42)';
  const stroke = active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)';
  const tailFill = active ? 'rgb(29 78 216)' : 'rgb(38 38 42)';

  return (
    <button onClick={onClick} className="relative block w-full" title={label}>
      <svg viewBox="0 0 140 50" className="h-auto w-full overflow-visible">
        <path d="M 4 34 L 20 34 L 20 50 L 12 43 L 4 50 Z" fill={tailFill} />
        <path d="M 120 34 L 136 34 L 136 50 L 128 43 L 120 50 Z" fill={tailFill} />
        <rect x="0" y="0" width="140" height="34" fill={fill} stroke={stroke} strokeWidth="1" />
        <rect x="4" y="4" width="132" height="26" fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
      <span
        className={cn(
          'absolute inset-x-0 top-0 flex h-8.5 items-center justify-center text-xs font-semibold tracking-wide uppercase',
          active ? 'text-white' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </button>
  );
}

/* ------------------------- Top photographer (with levels) ------------------------- */

function PhotographerLevelRanks() {
  const [activeLevel, setActiveLevel] = useState(LEVELS[0]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isClickScrolling = useRef(false);

  const scrollTo = (level: string) => {
    setActiveLevel(level);
    isClickScrolling.current = true;
    sectionRefs.current[level]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const level = (visible[0].target as HTMLElement).dataset.level;
          if (level) setActiveLevel(level);
        }
      },
      {
        root: null,
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0,
      },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex items-start gap-5">
      <div className="sticky top-31 z-10 flex w-32 shrink-0 flex-col gap-4">
        {LEVELS.map((level) => (
          <RibbonButton
            key={level}
            label={level}
            active={activeLevel === level}
            onClick={() => scrollTo(level)}
          />
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-8 pr-1">
        {LEVELS.map((level) => {
          return (
            <div
              key={level}
              ref={(node) => {
                sectionRefs.current[level] = node;
              }}
              data-level={level}
              className="flex flex-col gap-3 pt-32"
            >
              {/* ribbon badge - side button er sathe design match, normal flow (sticky na) */}
              <div className="flex justify-center pb-10">
                <div className="w-40">
                  <RibbonButton
                    label={level}
                    active={activeLevel === level}
                    onClick={() => scrollTo(level)}
                  />
                </div>
              </div>

              {(PHOTOGRAPHER_RANKS[level] ?? []).map((r) => (
                <RankCard key={r.rank} {...r} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------- Top photo / Guru's top pick (IMAGE GRID) ---------------------------- */

function PhotoGrid({ data }: { data: PhotoItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
      {data.map((item) => (
        <div
          key={item.id}
          className={cn(
            'group border-border relative aspect-square overflow-hidden border border-dashed',
            item.span,
          )}
        >
          <Image src={item.image} alt={item.name} fill sizes="200px" className="object-cover" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="border-border relative size-10 overflow-hidden rounded-full border">
              <Image src={item.avatar} alt={item.name} fill sizes="40px" className="object-cover" />
            </div>
            <div className="text-center leading-tight">
              <p className="text-xs font-medium text-white">{item.name}</p>
              <p className="text-[11px] text-white/70">{item.country}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- Shared card (photographer tab only) ---------------------------------- */

function RankCard({ rank, name, country, votes, avatar, photos }: Rank) {
  return (
    <div className="border-border flex items-center gap-5 rounded-lg border border-dashed p-4">
      <div className="flex w-10 shrink-0 items-center justify-center">
        <span className="text-primary text-3xl leading-none font-bold">{rank}</span>
      </div>

      <div className="flex w-16 shrink-0 flex-col items-center justify-center text-center">
        <p className="text-xl leading-none font-bold whitespace-nowrap">{votes}</p>
        <p className="text-muted-foreground text-xs">votes</p>
      </div>

      <div className="flex w-52 shrink-0 items-center gap-3">
        <div className="border-border relative size-14 shrink-0 overflow-hidden rounded-full border">
          <Image src={avatar} alt={name} fill sizes="56px" className="object-cover" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-tight font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">{country}</p>
          <button className="border-border hover:bg-surface-secondary mt-1 w-fit rounded-md border px-3 py-1 text-xs font-medium transition-colors">
            Follow
          </button>
        </div>
      </div>

      {/* fixed max 4 ta photo - ager design (h-32/h-40, gradient bottom-left vote) */}
      <div className="flex flex-1 justify-end gap-3">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="border-border relative h-32 w-32 shrink-0 overflow-hidden rounded-md border sm:h-40 sm:w-40"
          >
            <Image
              src={photo.src}
              alt={`${name} photo ${i + 1}`}
              fill
              sizes="160px"
              className="object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-black/80 to-transparent" />

            <p className="absolute bottom-2 left-2 text-base font-bold text-white">
              {photo.votes} <span className="text-xs font-normal text-white/80">votes</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankTab;

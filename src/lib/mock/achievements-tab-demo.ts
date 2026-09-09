import type { AchievementCardItem } from '@/components/module/public/AchievementCard';

/**
 * Demo data for the two achievement tabs.
 * Real API integration should replace these arrays — the `count` field
 * drives the disabled/enabled state (0 = locked, > 0 = unlocked) and
 * `cards` powers the card grid that appears when a badge is selected.
 *
 * `imageUrl` is the circular badge art shown in the grid. Swap with
 * real badge images from the CDN once the API is ready.
 */

export type Badge = {
  id: string;
  /** Short title shown in the card-section header. */
  title: string;
  imageUrl: string;
  count: number;
  cards: AchievementCardItem[];
};

// Curated award / medal / shield stock photos from Unsplash.
// Replace with real badge images later.
const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=300&h=300&q=80`;

// Card cover photos — landscape oriented.
const PHOTO = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

// ── Ultimate Achievement badges (shield / trophy style art) ──
export const ULTIMATE_BADGES: Badge[] = [
  {
    id: 'top-100-photographer',
    title: 'Top 100 Photographer',
    imageUrl: IMG('photo-1568822617270-2c1579f8dfe2'),
    count: 0,
    cards: [
      {
        id: 't100-1',
        title: 'Top 100 Photographer',
        imageUrl: PHOTO('photo-1469474968028-56623f02e42e'),
        date: '2026',
      },
      {
        id: 't100-2',
        title: 'Top 100 Photographer',
        imageUrl: PHOTO('photo-1506905925346-21bda4d32df4'),
        date: 'Mar 2026',
      },
      {
        id: 't100-3',
        title: 'Top 100 Photographer',
        imageUrl: PHOTO('photo-1418065460487-3e41a6c84dc5'),
        date: 'Jan 2026',
      },
    ],
  },
  {
    id: 'top-photo-editor',
    title: 'Top Photo Editor',
    imageUrl: IMG('photo-1530549387789-4c1017266635'),
    count: 0,
    cards: [
      {
        id: 'tpe-1',
        title: 'Top Photo Editor',
        imageUrl: PHOTO('photo-1452587925148-ce544e77e70d'),
        date: '2026',
      },
      {
        id: 'tpe-2',
        title: 'Top Photo Editor',
        imageUrl: PHOTO('photo-1542038784456-1ea8e935640e'),
        date: 'Feb 2026',
      },
    ],
  },
];

// ── Top Ranking badges (medal / numeric style art) ──
export const RANKING_BADGES: Badge[] = [
  {
    id: 'top-10-day',
    title: 'Top 10 — Day',
    imageUrl: IMG('photo-1559563458-527698bf5295'),
    count: 0,
    cards: [
      {
        id: 't10d-1',
        title: 'Top 10 — Day',
        imageUrl: PHOTO('photo-1470770841072-f978cf4d019e'),
        date: 'Day 14',
      },
    ],
  },
  {
    id: 'top-100-day',
    title: 'Top 100 — Day',
    imageUrl: IMG('photo-1567427017947-545c5f8d16ad'),
    count: 1,
    cards: [
      {
        id: 't100d-1',
        title: 'Top 100 — Day',
        imageUrl: PHOTO('photo-1426604966848-d7adac402bff'),
        date: 'Day 14',
      },
      {
        id: 't100d-2',
        title: 'Top 100 — Day',
        imageUrl: PHOTO('photo-1472214103451-9374bd1c798e'),
        date: 'Day 09',
      },
    ],
  },
  {
    id: 'top-10-year',
    title: 'Top 10 — Year',
    imageUrl: IMG('photo-1574629810360-7efbbe195018'),
    count: 0,
    cards: [
      {
        id: 't10y-1',
        title: 'Top 10 — Year',
        imageUrl: PHOTO('photo-1501785888041-af3ef285b470'),
        date: '2025',
      },
    ],
  },
  {
    id: 'top-100-year',
    title: 'Top 100 — Year',
    imageUrl: IMG('photo-1579952363873-27f3bade9f55'),
    count: 4,
    cards: [
      {
        id: 't100y-1',
        title: 'Top 100 — Year',
        imageUrl: PHOTO('photo-1419242902214-272b3f66ee7a'),
        date: '2025',
      },
      {
        id: 't100y-2',
        title: 'Top 100 — Year',
        imageUrl: PHOTO('photo-1500534314209-a25ddb2bd429'),
        date: '2024',
      },
      {
        id: 't100y-3',
        title: 'Top 100 — Year',
        imageUrl: PHOTO('photo-1470071459604-3b5ec3a7fe05'),
        date: '2023',
      },
      {
        id: 't100y-4',
        title: 'Top 100 — Year',
        imageUrl: PHOTO('photo-1441974231531-c6227db76b6e'),
        date: '2022',
      },
    ],
  },
  {
    id: 'top-10-percent',
    title: 'Top 10%',
    imageUrl: IMG('photo-1610348725531-843dff563e2c'),
    count: 0,
    cards: [
      {
        id: 't10p-1',
        title: 'Top 10%',
        imageUrl: PHOTO('photo-1447752875215-b2761acb3c5d'),
        date: '2026',
      },
    ],
  },
  {
    id: 'top-20-percent',
    title: 'Top 20%',
    imageUrl: IMG('photo-1572883454114-1cf0031ede2a'),
    count: 0,
    cards: [
      {
        id: 't20p-1',
        title: 'Top 20%',
        imageUrl: PHOTO('photo-1465146344425-f00d5f5c8f07'),
        date: '2026',
      },
    ],
  },
  {
    id: 'top-20-percent-2',
    title: 'Top 20%',
    imageUrl: IMG('photo-1567427013953-88102117053a'),
    count: 1,
    cards: [
      {
        id: 't20p-2',
        title: 'Top 20%',
        imageUrl: PHOTO('photo-1433086966358-54859d0ed716'),
        date: 'Mar 2026',
      },
    ],
  },
  {
    id: 'top-30-percent',
    title: 'Top 30%',
    imageUrl: IMG('photo-1567427018141-0584cfcbf1b8'),
    count: 1,
    cards: [
      {
        id: 't30p-1',
        title: 'Top 30%',
        imageUrl: PHOTO('photo-1502082553048-f009c37129b9'),
        date: 'Apr 2026',
      },
    ],
  },
];

/** First enabled badge in a list (count > 0), used as a fallback default. */
export function firstEnabledBadge(badges: Badge[]): Badge | null {
  return badges.find((b) => b.count > 0) ?? null;
}

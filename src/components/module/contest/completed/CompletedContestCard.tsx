import { formatDateToDayMonYear } from '@/utils/formatDateToDayMonYear';
import { CalendarDays } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdOutlineHowToVote } from 'react-icons/md';
import SafeBannerImage from '@/components/SafeBannerImage';

const achievementIconMap: Record<string, string> = {
  TOP_PHOTOGRAPHER: '/icons/top-photographer-v2.png',
  TOP_PHOTO: '/icons/top-photo-v2.png',
  WINNER: '/icons/award.png',
  AMATEUR: '/icons/contest-level-amateur.svg',
  TALENTED: '/icons/contest-level-talented.svg',
  SUPREME: '/icons/contest-level-supreme.svg',
  SUPERIOR: '/icons/contest-level-superior.svg',
  TOP_NOTCH: '/icons/contest-level-top-notch.svg',
  TOP_10_PHOTO: '/icons/top-photo-10.png',
  TOP_10_PHOTOGRAPHER: '/icons/top-photographer-10.png',
  TOP_20_PHOTO: '/icons/top-photo-20.png',
  TOP_20_PHOTOGRAPHER: '/icons/top-photographer-20.png',
  TOP_50_PHOTO: '/icons/top-photo-50.png',
  TOP_50_PHOTOGRAPHER: '/icons/top-photographer-50.png',
  TOP_100_PHOTO: '/icons/top-photo-100.png',
  TOP_100_PHOTOGRAPHER: '/icons/top-photographer-100.png',
  TOP_200_PHOTO: '/icons/top-photo-v2.png',
  TOP_200_PHOTOGRAPHER: '/icons/top-photographer-v2.png',
};

// Award grants are per-photo (e.g. two of a user's photos can both land in the
// contest's Top 10), so the raw achievement list can contain several rows for
// the same category. Collapse those into a single badge with a count instead
// of rendering duplicate circles.
const groupAchievementsByBadge = (achievements: any[]) => {
  const order: string[] = [];
  const grouped = new Map<string, { achievement: any; count: number }>();

  achievements.forEach((achievement) => {
    const key = achievement?.category || achievement?.levelBadge || achievement?.id;
    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, { achievement, count: 1 });
      order.push(key);
    }
  });

  return order.map((key) => grouped.get(key)!);
};

const formatAchievementLabel = (value: string) => {
  if (!value) return '';
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
};

const getContestAchievements = (contest: any) => {
  if (Array.isArray(contest?.achievements)) {
    return contest.achievements;
  }

  if (contest?.achievements?.data) {
    return contest.achievements.data;
  }

  return [];
};

const AchievementBadge = ({
  achievement,
  count,
  index,
}: {
  achievement: any;
  count: number;
  index: number;
}) => {
  const [showTextOnly, setShowTextOnly] = useState(false);
  const icon =
    achievement.imageUrl ||
    achievementIconMap[achievement.category] ||
    achievementIconMap[achievement.levelBadge];
  const label =
    achievement.levelBadge ||
    achievement.category ||
    achievement.title ||
    achievement.name ||
    'Achievement';

  return (
    <div
      key={achievement.id || index}
      className="flex w-28 flex-col items-center gap-2 text-center"
    >
      <div className="relative size-28">
        <div className="ring-border bg-surface flex size-full items-center justify-center overflow-hidden rounded-full ring-1">
          {icon && !showTextOnly ? (
            <Image
              alt={label}
              src={icon}
              fill
              className="object-contain p-3"
              onError={() => setShowTextOnly(true)}
            />
          ) : (
            <span className="text-muted-foreground px-2 text-[10px] font-medium">
              {formatAchievementLabel(label)}
            </span>
          )}
        </div>
        {count > 1 && (
          <span className="bg-primary text-primary-foreground ring-surface absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-2">
            {count}
          </span>
        )}
      </div>
      <span className="text-foreground/90 line-clamp-2 text-[10px] font-semibold tracking-wide uppercase">
        {formatAchievementLabel(label)}
      </span>
    </div>
  );
};

const EntryPhoto = ({ src }: { src?: string }) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
        No photo
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="Uploaded Photo"
      fill
      sizes="(max-width: 640px) 50vw, 220px"
      className="object-cover transition-transform duration-300 group-hover/photo:scale-110"
      onError={() => setErrored(true)}
    />
  );
};

const CompletedContestCard = ({ contest }: { contest: any }) => {
  const router = useRouter();
  const achievements = groupAchievementsByBadge(getContestAchievements(contest));
  const photos = contest?.photos?.data ?? [];

  return (
    <div className="text-foreground bg-surface-secondary border-border group overflow-hidden rounded-xl border-2 transition-shadow duration-300 hover:shadow-lg hover:shadow-black/30">
      {/* Banner */}
      <Link
        href={`/contest/${contest?.id}`}
        className="relative block h-56 w-full overflow-hidden md:h-64"
      >
        <SafeBannerImage
          src={contest?.banner}
          alt={`${contest?.title || 'Contest'} banner`}
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />

        <span className="bg-primary text-primary-foreground absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm">
          Completed
        </span>

        {/* Uploader credit — top right of the banner, only shown when the admin
            picked an existing user submission as the banner image. A nested <a> isn't
            valid here (the whole banner is already a Link), so this navigates via the
            router instead and stops the click from also triggering the outer link. */}
        {contest?.bannerUploader?.fullName && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/profile/${contest.bannerUploader.id}`);
            }}
            className="hover:text-primary absolute top-3 right-3 max-w-[60%] truncate rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm"
          >
            📷 {contest.bannerUploader.fullName}
          </button>
        )}

        <h2 className="absolute inset-x-0 bottom-0 line-clamp-2 p-4 text-xl font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.8)] md:text-2xl">
          {contest?.title}
        </h2>
      </Link>

      <div className="flex flex-col gap-6 p-4 md:p-5">
        {/* Achievements */}
        <div>
          <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
            Achievements
          </h3>
          {achievements.length ? (
            <div className="flex flex-wrap gap-4">
              {achievements.map(({ achievement, count }, index: number) => (
                <AchievementBadge
                  key={achievement.id || index}
                  achievement={achievement}
                  count={count}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No achievements yet</p>
          )}
        </div>

        {/* Submitted photos */}
        {photos.length > 0 && (
          <div>
            <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Your Entries
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((item: any, index: number) => (
                <div
                  key={index}
                  className="group/photo bg-surface relative aspect-4/3 overflow-hidden rounded-lg"
                >
                  <EntryPhoto src={item?.url} />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                  <p className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    <MdOutlineHowToVote /> {item?.voteCount ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats footer */}
        <div className="border-border flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <span className="bg-surface-tertiary text-primary flex size-9 items-center justify-center rounded-full">
              <MdOutlineHowToVote className="text-base" />
            </span>
            <div>
              <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                Total Votes
              </p>
              <p className="text-sm font-bold">{contest?.totalVotes ?? 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-muted-foreground text-[10px] tracking-wide uppercase">End Date</p>
              <p className="text-sm font-bold">{formatDateToDayMonYear(contest?.endDate)}</p>
            </div>
            <span className="bg-surface-tertiary text-primary flex size-9 items-center justify-center rounded-full">
              <CalendarDays className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedContestCard;

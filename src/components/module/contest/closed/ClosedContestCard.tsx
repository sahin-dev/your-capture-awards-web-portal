import CornerCount from '@/components/CornerCount';
import { formatDateToDayMonYear } from '@/utils/formatDateToDayMonYear';
import { formatPrizeRange } from '@/utils/formatPrizeRange';
import Image from 'next/image';
import Link from 'next/link';
import SafeBannerImage from '@/components/SafeBannerImage';

const ClosedContestCard = ({ contest }: { contest: any }) => {
  const maxUploads = contest?.maxUploads ?? contest?.maxUpload ?? 0;

  return (
    <div>
      <div className="group border-border relative block h-72 overflow-hidden rounded-xl border-2">
        <Link href={`/contest/${contest?.id}`} className="absolute inset-0 z-0">
          {/* Banner image */}
          <SafeBannerImage
            alt={`${contest?.title || 'Contest'} banner`}
            src={contest?.banner}
            className="bg-surface-secondary object-cover transition-all duration-300 group-hover:brightness-50"
            sizes="(max-width: 768px) 100vw, 500px"
            fallbackClassName="pb-16"
          />
        </Link>

        {/* Top gradient — ensures title is always readable */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-linear-to-b from-black/85 to-transparent" />

        {/* Upload limit badge */}
        <CornerCount count={maxUploads} className="z-10" />

        {/* Creator Info on hover — top left. Desktop-only reveal (md+); touch devices
            have no hover state to trigger it. */}
        <div className="pointer-events-none absolute top-3 left-3 z-20 flex -translate-y-3 items-center gap-2 opacity-0 transition-all duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <Image
            src={contest?.creator?.avatar}
            alt="Author"
            width={28}
            height={28}
            className="bg-border size-7 min-w-7 rounded-full border border-white/20 object-cover"
          />
          <p className="text-xs font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
            By {contest?.creator?.fullName ?? 'Unknown'}
          </p>
        </div>

        {/* Title — top left. Hides on hover to reveal Creator Info, but only at md+
            since mobile has no hover to bring it back. */}
        <Link
          href={`/contest/${contest?.id}`}
          className="absolute top-3 right-14 left-3 z-10 block transition-all duration-300 md:group-hover:opacity-0"
        >
          <h3 className="line-clamp-2 text-base leading-snug font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,1)] hover:underline">
            {contest?.title}
          </h3>
        </Link>

        {/* Footer stats — absolute bottom, zero gap */}
        <div className="text-foreground absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-zinc-950/90 py-2">
          {contest?.isMoneyContest && (
            <div className="border-primary flex h-12 flex-1 flex-col items-center justify-center border-r px-1">
              <p className="font-semibold">
                {formatPrizeRange(contest?.minPrize, contest?.maxPrize)}
              </p>
              <p className="text-xs">Prizes</p>
            </div>
          )}

          <div className="border-primary flex h-12 flex-[1.3] flex-col items-center justify-center border-r px-1 text-sm">
            {formatDateToDayMonYear(contest?.endDate)}
          </div>

          <div className="flex h-12 flex-1 flex-col items-center justify-center px-1">
            <p className="font-semibold">{contest?.totalVotes}</p>
            <p className="text-xs">Votes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosedContestCard;

'use client';

import TipTapViewer from '@/components/custom/tiptap-editor/TipTapViewer';
import { TabsContent } from '@/components/ui/tabs';
import { formatDateToDayMonYear } from '@/utils/formatDateToDayMonYear';
import { formatPrizeRange } from '@/utils/formatPrizeRange';
import { Globe, UserRound } from 'lucide-react';
import Image from 'next/image';
import { FaHourglassHalf } from 'react-icons/fa';
import { MdOutlineHowToVote, MdOutlinePaid } from 'react-icons/md';
import CountdownTimer from '@/components/CountdownTimer';

const DetailsTab = ({ contest, value }: { contest: any; value: string }) => {
  const now = new Date();
  const contestStart = new Date(contest?.startDate);
  const contestEnd = new Date(contest?.endDate);

  const hasStarted = now >= contestStart;
  const hasEnded = now > contestEnd;

  return (
    <TabsContent value={value} className="mx-auto w-full max-w-5xl space-y-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center lg:gap-3">
        <p className="flex flex-1 items-center gap-3 whitespace-nowrap uppercase">
          <MdOutlineHowToVote className="text-primary size-8 lg:size-10" />{' '}
          {!hasStarted ? (
            <span className="flex items-center gap-2">
              <span className="text-lg font-semibold">VOTING</span> STARTS SOON
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-lg font-semibold">{contest?.totalVotes}</span> Votes
            </span>
          )}
        </p>

        <div className="flex flex-1 items-center gap-3 whitespace-nowrap uppercase">
          <FaHourglassHalf className="text-primary size-8 lg:size-10" />
          {hasEnded ? (
            <p className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {formatDateToDayMonYear(contest?.endDate)}
              </span>
              Ended
            </p>
          ) : hasStarted ? (
            <CountdownTimer
              startDate={contest?.startDate}
              endDate={contest?.endDate}
              className="text-lg font-semibold"
            />
          ) : (
            <p className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {formatDateToDayMonYear(contest?.startDate)}
              </span>
              Starts Soon
            </p>
          )}
        </div>

        {contest?.isMoneyContest && (
          <div className="flex flex-1 items-center gap-3 whitespace-nowrap">
            <MdOutlinePaid className="text-primary size-8 lg:size-10" />{' '}
            <p className="flex items-center gap-2 uppercase">
              <span className="text-lg font-semibold">
                {formatPrizeRange(contest?.minPrize, contest?.maxPrize)}
              </span>{' '}
              IN AWARDS
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="flex w-full shrink-0 flex-col items-center justify-center gap-3 text-center sm:w-40">
          {contest?.creator?.avatar ? (
            <Image
              alt={contest?.creator?.fullName ?? 'Contest creator'}
              src={contest.creator.avatar}
              width={96}
              height={96}
              className="border-border size-24 rounded-full border object-cover"
            />
          ) : (
            <div className="border-border flex size-24 items-center justify-center rounded-full border">
              <UserRound className="text-muted-foreground size-9" />
            </div>
          )}
          <div>
            <p className="font-medium">{contest?.creator?.fullName ?? 'Contest creator'}</p>
            {contest?.creator?.location && (
              <p className="text-muted-foreground mt-1 flex items-center justify-center gap-1 text-xs">
                <Globe className="size-3.5" /> {contest.creator.location}
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-xl">
            <span className="text-primary font-bold">{contest?.title}</span> challenge
          </h1>
          {contest?.description ? (
            <TipTapViewer
              content={contest.description}
              className="text-muted-foreground leading-relaxed"
            />
          ) : (
            <p className="text-muted-foreground">No contest description has been added yet.</p>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default DetailsTab;

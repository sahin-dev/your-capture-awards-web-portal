import { Button } from '@/components/ui/button';
import { FaHourglassHalf } from 'react-icons/fa';
import { MdOutlineHowToVote, MdOutlinePaid } from 'react-icons/md';
import { IconPlaceholder } from './IconPlaceholder';

export function DetailsTab() {
  // fake/demo data - eigula pore actual contest prop diye replace hobe
  const isVotingStarted = false;
  const isContestEnded = false;
  const isCountdownActive = false;
  const isMonetaryContest = true;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center lg:gap-3">
        <div className="flex flex-1 items-center gap-3 whitespace-nowrap uppercase">
          <MdOutlineHowToVote className="text-primary size-8 lg:size-10" />{' '}
          {isVotingStarted ? (
            <span className="flex items-center gap-2">
              <span className="text-lg font-semibold">VOTING</span> STARTS SOON
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-lg font-semibold">1000</span> Votes
            </span>
          )}
        </div>

        <div className="flex flex-1 items-center gap-3 whitespace-nowrap uppercase">
          <FaHourglassHalf className="text-primary size-8 lg:size-10" />
          {isContestEnded ? (
            <p className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {/* {formatDateToDayMonYear(contest?.endDate)}  */} Jul 07, 2026
              </span>
              Ended
            </p>
          ) : isCountdownActive ? (
            // <CountdownTimer
            //   startDate={contest?.startDate}
            //   endDate={contest?.endDate}
            //   className="text-lg font-semibold"
            // />
            'Jul 07, 2026'
          ) : (
            <p className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                {/* {formatDateToDayMonYear(contest?.startDate)} */} Jul 07, 2026
              </span>
              Starts Soon
            </p>
          )}
        </div>

        {isMonetaryContest ? (
          <div className="flex flex-1 items-center gap-3 whitespace-nowrap">
            <MdOutlinePaid className="text-primary size-8 lg:size-10" />{' '}
            <p className="flex items-center gap-2 uppercase">
              <span className="text-lg font-semibold">15000</span> IN AWARDS
            </p>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-3 whitespace-nowrap">
            <MdOutlinePaid className="text-primary size-8 lg:size-10" />{' '}
            <p className="flex items-center gap-2 uppercase">
              <span className="text-lg font-semibold">Non-monetary </span> contest
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="flex w-full shrink-0 flex-col items-center justify-center gap-3 text-center sm:w-40">
          <div className="border-border flex size-24 items-center justify-center rounded-full border">
            <IconPlaceholder name="aperture" />
          </div>
          <p className="font-medium">Host team</p>
          <Button size="sm" className="px-10">
            Follow
          </Button>
        </div>

        <div className="flex-1 space-y-3">
          <h2 className="text-xl">
            <span className="text-primary font-bold">Open theme</span> contest
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An open-theme round with no subject limits - bring whatever you shoot best. Place near
            the top and your photo gets featured on the front page for the whole community to see.
          </p>
          <p className="text-sm font-medium">Enter the contest and earn rewards!</p>
          <ul className="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm">
            <li>Participation reward: 10 coins</li>
            <li>Elite level reward: 20 coins</li>
            <li>Allstar level reward: 50 coins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

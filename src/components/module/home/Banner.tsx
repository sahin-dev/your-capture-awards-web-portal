'use client';

import CountUp from '@/components/CountUp';
import { useGetSiteStatsQuery } from '@/store/apis/statsApi';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa6';
import { HiOutlineChevronDown } from 'react-icons/hi';

const Banner = () => {
  const { data } = useGetSiteStatsQuery(undefined, {
    pollingInterval: 30000,
  });

  const online = data?.data?.online;
  const playingNow = data?.data?.playingNow;

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden">
      {/* Photograph, drifting slowly so the hero never sits completely still */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/banner.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns object-cover object-center"
        />

        {/* Layered scrims: a base wash, a left-weighted ramp that protects the
            copy, and a bottom fade that hands off to the next section. */}
        <div className="bg-overlay-hero absolute inset-0" />
        <div className="from-background via-background/70 lg:via-background/40 absolute inset-0 bg-gradient-to-r to-transparent" />
        <div className="from-background absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t to-transparent" />

        {/* Warm brand bloom in the upper right */}
        <div className="bg-primary/20 animate-pulse-glow pointer-events-none absolute -top-40 -right-40 size-[34rem] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 container grid items-center gap-16 py-32 lg:grid-cols-[minmax(0,1fr)_auto]">
        {/* Left column */}
        <div className="max-w-2xl">
          {/* Award lockup */}
          <div
            className="animate-fade-in flex items-center gap-4"
            style={{ animationDelay: '80ms', animationFillMode: 'both' }}
          >
            <div className="relative">
              <div className="bg-primary/25 absolute inset-0 rounded-full blur-2xl" />
              <Image
                alt="Your Capture Awards"
                src="/icons/award.png"
                width={76}
                height={76}
                className="relative"
              />
            </div>

            <div className="border-primary/30 border-l pl-4">
              <p className="eyebrow">The</p>
              <p className="font-editorial text-gradient-brand text-xl leading-tight font-semibold">
                Capture
                <br />
                Award
              </p>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in font-editorial text-heading mt-8 text-5xl leading-[1.05] font-medium text-balance sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '180ms', animationFillMode: 'both' }}
          >
            Shoot. Compete.
            <br />
            <span className="text-gradient-brand">Be recognised.</span>
          </h1>

          {/* Subtext */}
          <p
            className="animate-fade-in text-body mt-6 max-w-lg text-lg leading-relaxed text-pretty"
            style={{ animationDelay: '280ms', animationFillMode: 'both' }}
          >
            The destination for photographers who want their work judged, celebrated and seen —
            head-to-head contests, expert critique and a global audience.
          </p>

          {/* Live stats */}
          <div
            className="animate-fade-in mt-10 flex flex-wrap items-center gap-10"
            style={{ animationDelay: '380ms', animationFillMode: 'both' }}
          >
            <div>
              <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase">
                <span className="relative flex size-2">
                  <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-70" />
                  <span className="bg-success relative inline-flex size-2 rounded-full" />
                </span>
                Online
              </p>
              <CountUp
                value={online}
                className="font-editorial text-heading mt-2 block text-3xl font-medium tabular-nums"
              />
            </div>

            <div className="bg-border-strong hidden h-12 w-px sm:block" />

            <div>
              <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase">
                <span className="bg-primary size-2 rounded-full" />
                Competing now
              </p>
              <CountUp
                value={playingNow}
                className="font-editorial text-heading mt-2 block text-3xl font-medium tabular-nums"
              />
            </div>
          </div>

          {/* Actions */}
          <div
            className="animate-fade-in mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: '480ms', animationFillMode: 'both' }}
          >
            <Link
              href="/signup"
              className="group bg-primary text-primary-foreground relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              {/* Light sweep on hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Enter a contest</span>
              <FaArrowRight className="relative size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/about"
              className="group border-border-strong text-foreground hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold transition-all duration-300"
            >
              How it works
              <FaArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right column — floating craft marks, decorative only */}
        <div className="pointer-events-none relative hidden h-96 w-64 lg:block" aria-hidden="true">
          <Image
            alt=""
            src="/icons/linked-camera.png"
            width={132}
            height={132}
            className="animate-float absolute top-4 right-4 opacity-70 drop-shadow-2xl"
          />
          <Image
            alt=""
            src="/icons/camera.png"
            width={62}
            height={62}
            className="animate-float absolute bottom-24 left-0 opacity-50"
            style={{ animationDelay: '1.2s' }}
          />
          <Image
            alt=""
            src="/icons/badge.png"
            width={34}
            height={34}
            className="animate-float absolute top-1/2 right-24 opacity-40"
            style={{ animationDelay: '2.4s' }}
          />
          <Image
            alt=""
            src="/icons/capture.png"
            width={54}
            height={54}
            className="animate-float absolute right-16 bottom-0 opacity-40"
            style={{ animationDelay: '0.6s' }}
          />
        </div>
      </div>

      {/* Scroll affordance */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-[10px] font-medium tracking-[0.3em] uppercase">
          Scroll
        </span>
        <HiOutlineChevronDown className="text-primary animate-scroll-nudge size-5" />
      </div>
    </section>
  );
};

export default Banner;
